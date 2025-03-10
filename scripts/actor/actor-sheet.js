/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CWNActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cwn", "sheet", "actor"],
      template: "systems/cwn-system/templates/actor/actor-sheet.hbs",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }],
      dragDrop: [
        {dragSelector: ".item-list .item", dropSelector: null},
        {dragSelector: ".actor-list .actor", dropSelector: null}
      ],
      scrollY: [".sheet-body", ".tab.skills", ".tab.items", ".tab.effects"]
    });
  }

  /** @override */
  get template() {
    const path = `systems/cwn-system/templates/actor/actor-${this.actor.type}-sheet.hbs`;
    console.log(`CWN | 액터 시트 템플릿 요청: ${path}`);
    
    // 템플릿 존재 여부 확인
    fetch(path)
      .then(response => {
        console.log(`CWN | 액터 템플릿 존재 여부: ${response.ok ? '존재함' : '존재하지 않음'}`);
        if (!response.ok) {
          console.error(`CWN | 액터 템플릿을 찾을 수 없음: ${path}`);
        }
      })
      .catch(error => {
        console.error(`CWN | 액터 템플릿 확인 중 오류 발생:`, error);
      });
    
    return path;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet.
    const context = await super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Prepare faction data.
    if (actorData.type == 'faction') {
      this._prepareFactionData(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Add config data
    context.config = CONFIG.CWN;

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.system.attributes)) {
      v.label = game.i18n.localize(CONFIG.CWN.attributes[k]) ?? k;
    }
  }

  /**
   * 아이템 준비 및 분류
   * @param {Object} context 컨텍스트 데이터
   * @private
   */
  _prepareItems(context) {
    console.log("CWN | 액터 아이템 준비 시작");
    
    // 모든 아이템 가져오기
    const allItems = context.items || [];
    
    // 기본 이미지 설정
    allItems.forEach(i => {
      i.img = i.img || DEFAULT_TOKEN;
    });
    
    // 기존 방식의 아이템 분류 (하위 호환성 유지)
    const skills = allItems.filter(i => i.type === 'skill');
    const foci = allItems.filter(i => i.type === 'focus');
    const weapons = allItems.filter(i => i.type === 'weapon');
    const armor = allItems.filter(i => i.type === 'armor');
    const gear = allItems.filter(i => i.type === 'gear');
    const cyberware = allItems.filter(i => i.type === 'cyberware');
    
    // 기본 정렬 (이름순)
    skills.sort((a, b) => a.name.localeCompare(b.name));
    foci.sort((a, b) => a.name.localeCompare(b.name));
    weapons.sort((a, b) => a.name.localeCompare(b.name));
    armor.sort((a, b) => a.name.localeCompare(b.name));
    gear.sort((a, b) => a.name.localeCompare(b.name));
    cyberware.sort((a, b) => a.name.localeCompare(b.name));
    
    // 기존 방식 컨텍스트에 할당
    context.skills = skills;
    context.foci = foci;
    context.weapons = weapons;
    context.armor = armor;
    context.gear = gear;
    context.cyberware = cyberware;
    
    // 새로운 분류 시스템 적용
    try {
      // 1. 카테고리별 그룹화
      const groupedItems = this._groupItemsByCategory(allItems);
      context.groupedItems = groupedItems;
      
      // 2. 장착된 아이템 분류
      const equippedItems = allItems.filter(i => i.system.equipped === true);
      context.equippedItems = equippedItems;
      
      // 3. 태그별 아이템 분류
      const taggedItems = this._groupItemsByTags(allItems);
      context.taggedItems = taggedItems;
      
      console.log("CWN | 액터 아이템 준비 완료:", {
        groupedItems,
        equippedItems,
        taggedItems
      });
    } catch (error) {
      console.error("CWN | 액터 아이템 준비 중 오류 발생:", error);
    }
  }
  
  /**
   * 아이템을 카테고리별로 그룹화
   * @param {Array} items 아이템 배열
   * @returns {Object} 카테고리별로 그룹화된 아이템
   * @private
   */
  _groupItemsByCategory(items) {
    console.log("CWN | 아이템 카테고리별 그룹화 시작");
    
    // 카테고리 정의 확인
    const itemCategories = game.cwn?.itemCategories;
    if (!itemCategories) {
      console.error("CWN | 아이템 카테고리 정의를 찾을 수 없습니다.");
      return {};
    }
    
    // 결과 객체 초기화
    const result = {};
    
    // 각 카테고리 초기화
    Object.entries(itemCategories).forEach(([key, category]) => {
      result[key] = {
        label: category.label,
        icon: category.icon,
        items: []
      };
    });
    
    // 아이템을 해당 카테고리에 할당
    items.forEach(item => {
      let assigned = false;
      
      // 아이템 타입에 맞는 카테고리 찾기
      Object.entries(itemCategories).forEach(([key, category]) => {
        if (category.types.includes(item.type)) {
          result[key].items.push(item);
          assigned = true;
        }
      });
      
      // 할당되지 않은 아이템은 기타 카테고리에 추가
      if (!assigned && result.other) {
        result.other.items.push(item);
      }
    });
    
    console.log("CWN | 아이템 카테고리별 그룹화 완료:", result);
    return result;
  }
  
  /**
   * 아이템을 태그별로 그룹화
   * @param {Array} items 아이템 배열
   * @returns {Object} 태그별로 그룹화된 아이템
   * @private
   */
  _groupItemsByTags(items) {
    const taggedItems = {};
    const tagCategories = game.cwn.itemTagCategories;
    
    // 태그 카테고리 초기화
    Object.keys(tagCategories).forEach(category => {
      const categoryData = tagCategories[category];
      taggedItems[category] = {
        label: categoryData.label,
        tags: {}
      };
      
      // 각 태그별 초기화
      categoryData.tags.forEach(tag => {
        taggedItems[category].tags[tag] = {
          label: `CWN.Tag.${tag.charAt(0).toUpperCase() + tag.slice(1)}`,
          items: []
        };
      });
    });
    
    // 아이템 분류
    items.forEach(item => {
      const itemTags = item.system.tags || [];
      
      itemTags.forEach(tag => {
        // 태그가 속한 카테고리 찾기
        for (const [catKey, catData] of Object.entries(tagCategories)) {
          if (catData.tags.includes(tag)) {
            if (taggedItems[catKey]?.tags[tag]) {
              taggedItems[catKey].tags[tag].items.push(item);
            }
            break;
          }
        }
      });
    });
    
    return taggedItems;
  }

  /**
   * Prepare faction data.
   *
   * @param {Object} context The actor data to prepare.
   *
   * @return {undefined}
   */
  _prepareFactionData(context) {
    // Initialize containers.
    const assets = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to assets.
      if (i.type === 'asset') {
        assets.push(i);
      }
    }

    // Sort assets by name
    assets.sort((a, b) => a.name.localeCompare(b.name));

    // Assign and return
    context.assets = assets;
  }

  /* -------------------------------------------- */

  /**
   * 이벤트 리스너 활성화
   * @param {jQuery} html 
   */
  activateListeners(html) {
    super.activateListeners(html);
    
    console.log("CWN | 액터 시트 이벤트 리스너 활성화");

    // 모든 버튼에 대한 클릭 이벤트 처리
    html.find('button').click(this._onButtonClick.bind(this));
    
    // 아이템 관련 이벤트
    if (this.actor.isOwner) {
      // 아이템 생성
      html.find('.item-create').click(this._onItemCreate.bind(this));
      
      // 아이템 편집
      html.find('.item-edit').click(this._onItemEdit.bind(this));
      
      // 아이템 삭제
      html.find('.item-delete').click(this._onItemDelete.bind(this));
      
      // 아이템 장착 토글
      html.find('.item-equip').click(this._onToggleItemEquipped.bind(this));
      
      // 아이템 복제
      if (this._onItemDuplicate) {
        html.find('.item-duplicate').click(this._onItemDuplicate.bind(this));
      }
      
      // 아이템 검색
      html.find('.item-search').keyup(this._onSearchItems.bind(this));
      
      // 아이템 필터
      html.find('.item-filter').click(this._onFilterItems.bind(this));
      
      // 아이템 정렬
      html.find('.item-sort').click(this._onSortItems.bind(this));
      
      // 카테고리 토글
      html.find('.category-header').click(this._onToggleCategory.bind(this));
    }
    
    // 주사위 굴림 이벤트
    html.find('.rollable').click(this._onRoll.bind(this));
    
    // 액티브 이펙트 관리
    html.find('.effect-control').click(ev => onManageActiveEffect(ev, this.actor));
    
    console.log("CWN | 액터 시트 이벤트 리스너 활성화 완료");
  }

  /**
   * Shows a dialog to confirm item deletion
   * @param {Item} item The item to delete
   * @private
   */
  _deleteItemDialog(item) {
    const content = `<p>Are you sure you want to delete ${item.name}?</p>`;
    
    new Dialog({
      title: `Delete ${item.name}`,
      content: content,
      buttons: {
        delete: {
          icon: '<i class="fas fa-trash"></i>',
          label: "Delete",
          callback: () => item.delete()
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: "cancel"
    }).render(true);
  }

  /**
   * Opens the item sheet for the given item
   * @param {Item} item The item to open
   * @private
   */
  _openItemSheet(item) {
    item.sheet.render(true);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
    
    // Handle attribute rolls
    if (dataset.attribute) {
      const attribute = dataset.attribute;
      const attrData = this.actor.system.attributes[attribute];
      if (attrData) {
        const formula = `1d20 + ${attrData.mod}`;
        const label = game.i18n.format("CWN.AttributeCheck", {
          attribute: game.i18n.localize(CONFIG.CWN.attributes[attribute])
        });
        
        let roll = new Roll(formula, this.actor.getRollData());
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: label,
          rollMode: game.settings.get('core', 'rollMode'),
        });
        return roll;
      }
    }
    
    // Handle save rolls
    if (dataset.save) {
      const saveId = dataset.save;
      return this.actor.rollSave(saveId);
    }
    
    // Handle skill rolls
    if (dataset.skill) {
      const skillId = dataset.skill;
      return this.actor.rollSkill(skillId);
    }
  }

  /** @override */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    
    // Add custom buttons
    if (this.actor.isOwner) {
      buttons.unshift({
        label: "Effects",
        class: "manage-effects",
        icon: "fas fa-bolt",
        onclick: ev => this._onManageActiveEffects(ev)
      });
    }
    
    return buttons;
  }
  
  /**
   * Handle management of Active Effects
   * @param {Event} event The triggering event
   * @private
   */
  _onManageActiveEffects(event) {
    event.preventDefault();
    new ActiveEffectConfig(this.actor).render(true);
  }

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @return {Promise<Object>}    A data object which describes the result of the drop
   * @private
   */
  async _onDropItemCreate(itemData) {
    // Check if item already exists
    const existingItem = this.actor.items.find(i => 
      i.name === itemData.name && i.type === itemData.type
    );
    
    if (existingItem) {
      // Show dialog to ask if user wants to duplicate the item
      return this._duplicateItemDialog(itemData.name);
    }
    
    // Create the owned item
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }
  
  /**
   * Shows a dialog to confirm item duplication
   * @param {string} itemName The name of the item to duplicate
   * @private
   */
  async _duplicateItemDialog(itemName) {
    return new Promise((resolve, reject) => {
      new Dialog({
        title: `Duplicate Item`,
        content: `<p>An item named "${itemName}" already exists on this Actor. Do you want to create a duplicate?</p>`,
        buttons: {
          duplicate: {
            icon: '<i class="fas fa-copy"></i>',
            label: "Create Duplicate",
            callback: () => {
              resolve(true);
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: () => {
              resolve(false);
            }
          }
        },
        default: "cancel",
        close: () => resolve(false)
      }).render(true);
    });
  }

  /**
   * 아이템 검색 처리
   * @param {Event} event 이벤트 객체
   * @private
   */
  _onSearchItems(event) {
    event.preventDefault();
    
    const searchTerm = event.target.value.toLowerCase().trim();
    console.log(`CWN | 아이템 검색: "${searchTerm}"`);
    
    // 검색어가 없으면 모든 아이템 표시
    if (!searchTerm) {
      this._resetItemFilters();
      return;
    }
    
    // 모든 아이템 요소 가져오기
    const itemElements = this.element.find('.categorized-items-container .item');
    
    // 각 아이템 요소 검사
    itemElements.each((i, el) => {
      const itemEl = $(el);
      const itemName = itemEl.find('h4').text().toLowerCase();
      const itemType = itemEl.find('.item-type').text().toLowerCase();
      
      // 이름이나 타입에 검색어가 포함되어 있으면 표시, 아니면 숨김
      if (itemName.includes(searchTerm) || itemType.includes(searchTerm)) {
        itemEl.show();
        // 부모 카테고리 섹션도 표시
        itemEl.closest('.category-section').show();
      } else {
        itemEl.hide();
      }
    });
    
    // 빈 카테고리 처리
    this._updateEmptyCategories();
  }
  
  /**
   * 아이템 필터링 처리
   * @param {Event} event 이벤트 객체
   * @private
   */
  _onFilterItems(event) {
    event.preventDefault();
    
    const filterButton = event.currentTarget;
    const filterType = filterButton.dataset.filter;
    const filterValue = filterButton.dataset.value;
    
    console.log(`CWN | 아이템 필터링: ${filterType}=${filterValue}`);
    
    // 필터 버튼 활성화 상태 토글
    if (filterButton.classList.contains('active')) {
      filterButton.classList.remove('active');
      this._resetItemFilters();
      return;
    } else {
      // 같은 유형의 다른 필터 버튼 비활성화
      this.element.find(`[data-action="filter-items"][data-filter="${filterType}"]`).removeClass('active');
      filterButton.classList.add('active');
    }
    
    // 모든 아이템 요소 가져오기
    const itemElements = this.element.find('.categorized-items-container .item');
    const categoryElements = this.element.find('.category-section');
    
    // 필터 유형에 따른 처리
    switch (filterType) {
      case 'all':
        // 모든 아이템 표시
        itemElements.show();
        categoryElements.show();
        break;
        
      case 'equipped':
        // 장착된 아이템만 표시
        itemElements.each((i, el) => {
          const itemId = el.dataset.itemId;
          const item = this.actor.items.get(itemId);
          
          if (item && item.system.equipped) {
            $(el).show();
          } else {
            $(el).hide();
          }
        });
        this._updateEmptyCategories();
        break;
        
      case 'category':
        // 특정 카테고리 아이템만 표시
        categoryElements.hide();
        this.element.find(`.category-section[data-category="${filterValue}"]`).show();
        break;
        
      case 'tag':
        // 특정 태그를 가진 아이템만 표시
        itemElements.each((i, el) => {
          const itemId = el.dataset.itemId;
          const item = this.actor.items.get(itemId);
          
          if (item && item.system.tags && item.system.tags.includes(filterValue)) {
            $(el).show();
            // 부모 카테고리 섹션도 표시
            $(el).closest('.category-section').show();
          } else {
            $(el).hide();
          }
        });
        this._updateEmptyCategories();
        break;
    }
  }
  
  /**
   * 아이템 정렬 처리
   * @param {Event} event 이벤트 객체
   * @private
   */
  _onSortItems(event) {
    event.preventDefault();
    
    const sortButton = event.currentTarget;
    const sortField = sortButton.dataset.sort;
    const sortDirection = sortButton.dataset.direction;
    
    console.log(`CWN | 아이템 정렬: ${sortField} (${sortDirection})`);
    
    // 정렬 버튼 활성화 상태 토글
    this.element.find('[data-action="sort-items"]').removeClass('active');
    sortButton.classList.add('active');
    
    // 각 카테고리별로 아이템 정렬
    const categoryElements = this.element.find('.category-section');
    
    categoryElements.each((i, categoryEl) => {
      const categoryKey = categoryEl.dataset.category;
      const itemsList = $(categoryEl).find('.items-list');
      const itemElements = itemsList.children('.item').toArray();
      
      // 아이템 정렬
      itemElements.sort((a, b) => {
        const itemA = this.actor.items.get(a.dataset.itemId);
        const itemB = this.actor.items.get(b.dataset.itemId);
        
        if (!itemA || !itemB) return 0;
        
        let valueA, valueB;
        
        // 정렬 필드에 따른 값 추출
        if (sortField === 'name') {
          valueA = itemA.name;
          valueB = itemB.name;
        } else if (sortField === 'type') {
          valueA = itemA.type;
          valueB = itemB.type;
        } else if (sortField.startsWith('system.')) {
          const systemField = sortField.substring(7);
          valueA = foundry.utils.getProperty(itemA.system, systemField) || 0;
          valueB = foundry.utils.getProperty(itemB.system, systemField) || 0;
        }
        
        // 값 비교
        let result;
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          result = valueA.localeCompare(valueB);
        } else {
          result = valueA - valueB;
        }
        
        // 정렬 방향 적용
        return sortDirection === 'asc' ? result : -result;
      });
      
      // 정렬된 아이템 요소 다시 추가
      itemElements.forEach(el => {
        itemsList.append(el);
      });
    });
  }
  
  /**
   * 카테고리 토글 처리
   * @param {Event} event 이벤트 객체
   * @private
   */
  _onToggleCategory(event) {
    event.preventDefault();
    
    const header = event.currentTarget;
    const categoryKey = header.dataset.category;
    const categoryItems = this.element.find(`.items-list[data-category="${categoryKey}"]`);
    const toggleIcon = header.querySelector('.toggle-icon');
    
    console.log(`CWN | 카테고리 토글: ${categoryKey}`);
    
    // 아이템 목록 표시/숨김 토글
    if (categoryItems.is(':visible')) {
      categoryItems.slideUp(200);
      toggleIcon.classList.remove('fa-chevron-down');
      toggleIcon.classList.add('fa-chevron-right');
    } else {
      categoryItems.slideDown(200);
      toggleIcon.classList.remove('fa-chevron-right');
      toggleIcon.classList.add('fa-chevron-down');
    }
  }
  
  /**
   * 아이템 장착 상태 토글 처리
   * @param {Event} event 이벤트 객체
   * @private
   */
  _onToggleItemEquipped(event) {
    event.preventDefault();
    
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    
    if (!item) return;
    
    console.log(`CWN | 아이템 장착 상태 토글 UI 이벤트: ${item.name}`);
    
    // 새로운 toggleEquipped 메서드 사용
    item.toggleEquipped();
  }
  
  /**
   * 필터 초기화
   * @private
   */
  _resetItemFilters() {
    // 모든 아이템 및 카테고리 표시
    this.element.find('.categorized-items-container .item').show();
    this.element.find('.category-section').show();
    
    // 필터 버튼 비활성화
    this.element.find('[data-action="filter-items"]').removeClass('active');
    
    // 검색창 초기화
    this.element.find('[data-action="search-items"]').val('');
  }
  
  /**
   * 빈 카테고리 업데이트
   * @private
   */
  _updateEmptyCategories() {
    const categoryElements = this.element.find('.category-section');
    
    categoryElements.each((i, categoryEl) => {
      const visibleItems = $(categoryEl).find('.item:visible').length;
      
      if (visibleItems === 0) {
        $(categoryEl).hide();
      } else {
        $(categoryEl).show();
      }
    });
  }

  /**
   * 버튼 클릭 이벤트 처리
   * @param {Event} event 
   * @private
   */
  _onButtonClick(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const action = button.dataset.action;
    
    console.log(`CWN | 버튼 클릭: ${action}`);
    
    // 버튼 액션에 따른 처리
    switch (action) {
      case 'roll-ability':
        this._onRollAbility(event);
        break;
      case 'roll-save':
        this._onRollSave(event);
        break;
      case 'roll-skill':
        this._onRollSkill(event);
        break;
      // 추가 액션 처리
      default:
        console.log(`CWN | 처리되지 않은 버튼 액션: ${action}`);
    }
  }
  
  /**
   * 아이템 생성 이벤트 처리
   * @param {Event} event 
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    
    console.log(`CWN | 아이템 생성 요청: ${type}`);
    
    const itemData = {
      name: game.i18n.format("CWN.NewItem", {type: game.i18n.localize(`CWN.ItemType.${type}`)}),
      type: type,
      system: {}
    };
    
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }
  
  /**
   * 아이템 편집 이벤트 처리
   * @param {Event} event 
   * @private
   */
  _onItemEdit(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".item");
    const itemId = li.dataset.itemId;
    const item = this.actor.items.get(itemId);
    
    console.log(`CWN | 아이템 편집 요청: ${item?.name || itemId}`);
    
    if (item) {
      item.sheet.render(true);
    }
  }
  
  /**
   * 아이템 삭제 이벤트 처리
   * @param {Event} event 
   * @private
   */
  _onItemDelete(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".item");
    const itemId = li.dataset.itemId;
    const item = this.actor.items.get(itemId);
    
    console.log(`CWN | 아이템 삭제 요청: ${item?.name || itemId}`);
    
    if (item) {
      this._deleteItemDialog(item);
    }
  }
} 