///////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Constants //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

const CONFIG_ITEM_TYPE_ARMOR  = "Armors";
const CONFIG_ITEM_TYPE_WEAPON = "Weapons";

const CONFIG_ITEM_QUALITY_UNIQUE = "UNIQUE";
const CONFIG_ITEM_QUALITY_SET    = "SET";

const REMOVE_NO_ELEMENTS = 0;

const TC_INDEX_AFTER_GOLD = 1;

const RARITY1 = 1;
const RARITY2 = 2;
const RARITY3 = 3;

const TC_MIN       = 3;
const TC_MAX       = 87;
const TC_SIZE      = 3;
const TC_MAX_ITEMS = 10;

const ITEM_TYPE_ARMOR              = "ARMOR";
const ITEM_TYPE_WEAPON             = "WEAPON";
const ITEM_SUB_TYPE_WEAPON_MELEE   = "mele";
const ITEM_SUB_TYPE_WEAPON_MISSILE = "miss";
const NO_WEAPON_SUB_TYPE           = "NO_WEAPON_SUBTYPE";
const NO_ITEM_SUB_TYPE             = "";

const TC_NAME_ARMOR_PREFIX          = "armo";
const TC_NAME_WEAPON_PREFIX         = "weap";
const TC_NAME_WEAPON_MELEE_PREFIX   = "mele";
const TC_NAME_WEAPON_MISSILE_PREFIX = "bow";
const TC_NAME_SUFFIX                = "new";
const TC_NAME_RARIRY_SUFFIX         = "R";
const TC_NAME_PART_SUFFIX           = "P";

const TC_ITEM_COLUMN_PREFIX        = "Item";
const TC_PROBABILITY_COLUMN_PREFIX = "Prob";

const TC_NAME_COLUMN    = "Treasure Class";
const TC_NO_DROP_COLUMN = "NoDrop";

const ITEM_NAME_COLUMN  = "name";
const ITEM_CODE_COLUMN  = "code";
const ITEM_LEVEL_COLUMN = "level";
const ITEM_TYPE_COLUMN  = "type";

const ITEM_TYPES_SUB_TYPE_COLUMN = "Equiv1";

const TREASURE_CLASS_EX_FILENAME = 'global\\excel\\treasureClassEx.txt';
const WEAPONS_FILENAME           = 'global\\excel\\weapons.txt';
const ARMOR_FILENAME             = 'global\\excel\\armor.txt';
const ITEM_TYPES_FILENAME        = 'global\\excel\\itemtypes.txt';
const MISC_FILENAME              = 'global\\excel\\misc.txt';
const UNIQUE_ITEMS_FILENAME      = 'global\\excel\\uniqueitems.txt';
const SET_ITEMS_FILENAME         = 'global\\excel\\setitems.txt';
const ITEM_NAMES_FILENAME        = 'local\\lng\\strings\\item-names.json';

const TREASURE_CLASS_EX_FILE = D2RMM.readTsv(TREASURE_CLASS_EX_FILENAME);
const ITEM_TYPES_FILE        = D2RMM.readTsv(ITEM_TYPES_FILENAME);
const WEAPONS_FILE           = D2RMM.readTsv(WEAPONS_FILENAME);
const ARMOR_FILE             = D2RMM.readTsv(ARMOR_FILENAME);
const MISC_FILE              = D2RMM.readTsv(MISC_FILENAME);
const UNIQUE_ITEMS_FILE      = D2RMM.readTsv(UNIQUE_ITEMS_FILENAME);
const SET_ITEMS_FILE         = D2RMM.readTsv(SET_ITEMS_FILENAME);
const ITEM_NAMES_FILE        = D2RMM.readJson(ITEM_NAMES_FILENAME);

const LOG_ENABLED = false;
let logIndex = 1;

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// Main ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

handleGems();
handleRunes();
handleMiscItems();
handleItems(ITEM_TYPE_ARMOR);
handleItems(ITEM_TYPE_WEAPON);
handleItems(ITEM_TYPE_WEAPON, ITEM_SUB_TYPE_WEAPON_MELEE);
handleItems(ITEM_TYPE_WEAPON, ITEM_SUB_TYPE_WEAPON_MISSILE);

//generateConfig();

D2RMM.writeTsv(TREASURE_CLASS_EX_FILENAME, TREASURE_CLASS_EX_FILE);

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// Item Functions ///////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function handleItems(itemType, itemSubType) {
	
	if(itemSubType === undefined) {
		itemSubType = NO_ITEM_SUB_TYPE;
	}
	
	for(let currTcNumber = TC_MIN; currTcNumber <= TC_MAX; currTcNumber += TC_SIZE) {
		
		log("handleItems (" + itemType + ", " + itemSubType + ") currTcNumber = " + currTcNumber);

		const tcNamePrefix = getTcNamePrefix(itemType, itemSubType);
		log("handleItems (" + itemType + ", " + itemSubType + ") tcNamePrefix = " + tcNamePrefix);

		const items = getItems(itemType, currTcNumber);
		log("handleItems (" + itemType + ", " + itemSubType + ") items.length = " + items.length);

		const itemsRarity1 = items.filter(item => (+item.typeRarity) === RARITY1 && (itemSubType === NO_ITEM_SUB_TYPE || item.subType === itemSubType));
		const itemsRarity2 = items.filter(item => (+item.typeRarity) === RARITY2 && (itemSubType === NO_ITEM_SUB_TYPE || item.subType === itemSubType));
		const itemsRarity3 = items.filter(item => (+item.typeRarity) === RARITY3 && (itemSubType === NO_ITEM_SUB_TYPE || item.subType === itemSubType));
		
		log("handleItems (" + itemType + ", " + itemSubType + ") itemsRarity1.length = " + itemsRarity1.length);
		log("handleItems (" + itemType + ", " + itemSubType + ") itemsRarity2.length = " + itemsRarity2.length);
		log("handleItems (" + itemType + ", " + itemSubType + ") itemsRarity3.length = " + itemsRarity3.length);
		
		if(itemsRarity1.length + itemsRarity2.length + itemsRarity3.length === 0 ) {
			
			if(isEmptyTc(itemType, itemSubType, currTcNumber)) {
				continue;
			}
			
			throw "No items with type rarity 1,2 or 3 found for itemType = " + itemType + "; itemSubType = " + itemSubType + "; tc " + currTcNumber + "!";
			
		}
		
		const rarity1TCs = generateTcRows(itemsRarity1, currTcNumber, tcNamePrefix, RARITY1);
		const rarity2TCs = generateTcRows(itemsRarity2, currTcNumber, tcNamePrefix, RARITY2);
		const rarity3TCs = generateTcRows(itemsRarity3, currTcNumber, tcNamePrefix, RARITY3);

		const currTcName = tcNamePrefix + formattedTcNumber(currTcNumber) + TC_NAME_SUFFIX;
		log("handleItems (" + itemType + ", " + itemSubType + ") currTcName = " + currTcName);
		
		const currTc = {
			[TC_NAME_COLUMN]: currTcName,
			level: currTcNumber,
			Picks: 1,
			NoDrop: 0,		
		};
		
		let index = 1;
		
		if(rarity1TCs.length > 0) {
			
			const firstTC = rarity1TCs[0];
			
			currTc[TC_ITEM_COLUMN_PREFIX + index] = firstTC[TC_NAME_COLUMN];
			currTc[TC_PROBABILITY_COLUMN_PREFIX + index] = itemsRarity1.length * RARITY1;
			index++;
			
		}
		
		if(rarity2TCs.length > 0) {

			const firstTC = rarity2TCs[0];

			currTc[TC_ITEM_COLUMN_PREFIX + index] = firstTC[TC_NAME_COLUMN];
			currTc[TC_PROBABILITY_COLUMN_PREFIX + index] = itemsRarity2.length * RARITY2;
			index++;
			
		}
		
		if(rarity3TCs.length > 0) {
			
			const firstTC = rarity3TCs[0];

			currTc[TC_ITEM_COLUMN_PREFIX + index] = firstTC[TC_NAME_COLUMN];
			currTc[TC_PROBABILITY_COLUMN_PREFIX + index] = itemsRarity3.length * RARITY3;
			index++;
			
		}
		
		addTcAtPosition(TREASURE_CLASS_EX_FILE.rows, TC_INDEX_AFTER_GOLD, currTc);
		
		if(rarity1TCs.length > 0) {
			rarity1TCs.forEach((tc) => addTcAtPosition(TREASURE_CLASS_EX_FILE.rows, TC_INDEX_AFTER_GOLD, tc));			
		}
		
		if(rarity2TCs.length > 0) {
			rarity2TCs.forEach((tc) => addTcAtPosition(TREASURE_CLASS_EX_FILE.rows, TC_INDEX_AFTER_GOLD, tc));			
		}
		
		if(rarity3TCs.length > 0) {
			rarity3TCs.forEach((tc) => addTcAtPosition(TREASURE_CLASS_EX_FILE.rows, TC_INDEX_AFTER_GOLD, tc));			
		}
	
		let previousTcName = tcNamePrefix + currTcNumber;
		TREASURE_CLASS_EX_FILE.rows.forEach((currRow) => updateTcReferences(currRow, previousTcName, currTcName));

	}
	
}

function isEmptyTc(itemType, itemSubType, currTcNumber) {
	return itemType === ITEM_TYPE_WEAPON && itemSubType === ITEM_SUB_TYPE_WEAPON_MISSILE && (currTcNumber === 21 || currTcNumber === 66);
}

function itemToString(item) {
	
	var output = "";
	output += "category: " + item["category"] + "; ";
	output += "name: " + item["name"] + "; ";
	output += "code: " + item["code"] + "; ";
	output += "level: " + item["level"] + "; ";
	output += "type: " + item["type"] + "; ";
	output += "typeRarity: " + item["typeRarity"] + "; ";
	output += "subType: " + item["subType"] + "; ";
	output += "remove: " + item["remove"] + "; ";
	
	return output;
	
}

function getItemFile(itemType) {
	
	if(itemType === ITEM_TYPE_ARMOR) {
		return ARMOR_FILE;
	}
	
	if(itemType === ITEM_TYPE_WEAPON) {
		return WEAPONS_FILE;
	}
	
	throw "Given item type: " + itemType + " is not a known type!";
	
}

function getItems(itemType, treasureClassNumber) {
	
	const selectedItems = getItemFile(itemType).rows.filter((row) => treasureClassNumber - TC_SIZE < row.level && row.level <= treasureClassNumber);
	
	log("getItems selectedItems.length = " + selectedItems.length);
	
	const enrichedItems = selectedItems.map(item => ({ 
		category: itemType, 
		name: item.name, 
		level: item.level,
		code: item.code,
		type: item.type,
		typeRarity: getItemTypeRarity(item.type),
		subType: (itemType === ITEM_TYPE_WEAPON) ? (getWeaponSubType(item.type)) : (NO_ITEM_SUB_TYPE),
		remove: config[item.code],
	}));
	
	log("getItems enrichedItems.length = " + enrichedItems.length);
	
	for(let i = 0; i < enrichedItems.length; i++) {
		log("getItems enrichedItems[i] = " + itemToString(enrichedItems[i]));
	}
	
	return enrichedItems;

}

function getWeaponSubType(weaponTypeCode) {
	
	if(weaponTypeCode === "") {
		return NO_WEAPON_SUB_TYPE;
	}
	
	if(weaponTypeCode === "mele" || weaponTypeCode === "miss") {
		return weaponTypeCode;
	}
	
	const weaponType = ITEM_TYPES_FILE.rows.find((row) => row.Code === weaponTypeCode);
	const weaponSubTypeCode = weaponType[ITEM_TYPES_SUB_TYPE_COLUMN];
	
	return getWeaponSubType(weaponSubTypeCode);
	
}

function getItemTypeRarity(itemeCode) {
	return ITEM_TYPES_FILE.rows.find((row) => row.Code === itemeCode).Rarity;
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////// Misc Items Functions ////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function isMiscTc(treasureClassRow) {
	
	const treasureClassName = treasureClassRow[TC_NAME_COLUMN];
	return treasureClassName.toLowerCase().match(/(potion|ammo|misc)/) != null;

}

function isMiscItemType(item) {
	return item.type.match(/(hpot|mpot|rpot|spot|apot|wpot|bowq|xboq|scro|key)/) != null;
}

function isMiscWeaponType(item) {
	return item.type.match(/tpot/) != null;
}

function handleMiscItems() {
	
	MISC_FILE.rows
	.filter((currMiscItemRow) => isMiscItemType(currMiscItemRow))
	.forEach(

		(currMiscItemRow) => {
			
			log("handleMiscItems config[" + currMiscItemRow.code + "] = " + config[currMiscItemRow.code]);

			if(config[currMiscItemRow.code] === true) {

				TREASURE_CLASS_EX_FILE.rows.forEach(
					(currTcRow) => {
						updateTreasureClassRowItemToNoDrop(currTcRow, currMiscItemRow.code);	
					}
				);

			}
			
		}
	
	);
	
	WEAPONS_FILE.rows
	.filter((currWeaponRow) => isMiscWeaponType(currWeaponRow))
	.forEach(

		(currWeaponRow) => {
			
			log("handleMiscItems config[" + currWeaponRow.code + "] = " + config[currWeaponRow.code]);

			if(config[currWeaponRow.code] === true) {

				TREASURE_CLASS_EX_FILE.rows.forEach(
					(currTcRow) => {
						updateTreasureClassRowItemToNoDrop(currTcRow, currWeaponRow.code);	
					}
				);

			}
			
		}
	
	);
	
	if(config.gld) {
	
		TREASURE_CLASS_EX_FILE.rows
		.forEach(
			(currTcRow) => {
				updateTreasureClassRowItemToNoDrop(currTcRow, "gld");	
			}
		);
		
	}

}

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// Gems Functions ///////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function isGemTc(treasureClassRow) {
	
	const treasureClassName = treasureClassRow[TC_NAME_COLUMN];
	return treasureClassName.match(/^(Chipped|Flawed|Normal|Flawless) Gem$/) != null;
	
}

function isGemQualityItemType(itemType) {
	return itemType.Code.match(/gem(0|1|2|3)/) != null;
}

function handleGems() {

	const gemTreasureClasses = TREASURE_CLASS_EX_FILE.rows.filter((currTcRow) => isGemTc(currTcRow));
	
	log("handleGems gemTreasureClasses.length = " + gemTreasureClasses.length);

	ITEM_TYPES_FILE.rows
		.filter((currItemTypeRow) => isGemQualityItemType(currItemTypeRow))
		.forEach(

			(currItemTypeRow) => {
				
				log("handleGems config[" + currItemTypeRow.Code + "] = " + config[currItemTypeRow.Code]);

				if(config[currItemTypeRow.Code] === true) {

					gemTreasureClasses.forEach(
						(currTcRow) => {
							updateTreasureClassRowToFullNoDrop(currTcRow);
						}
					);

				}
				
			}
	
	);
	
}

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// Runes Functions //////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function isRuneTc(treasureClassRow) {
	
	const treasureClassName = treasureClassRow[TC_NAME_COLUMN];
	return treasureClassName.match(/^Runes /) != null;

}

function isRuneItemType(item) {
	return item.type === "rune";
}

function handleRunes() {
	
	const runeTreasureClasses = TREASURE_CLASS_EX_FILE.rows.filter((currTcRow) => isRuneTc(currTcRow));
	
	log("handleRunes runeTreasureClasses.length = " + runeTreasureClasses.length);

	MISC_FILE.rows
	.filter((currMiscItemRow) => isRuneItemType(currMiscItemRow))
	.forEach(

		(currMiscItemRow) => {
			
			log("handleMiscItems config[" + currMiscItemRow.code + "] = " + config[currMiscItemRow.code]);

			if(config[currMiscItemRow.code] === true) {

				runeTreasureClasses.forEach(
					(currTcRow) => {
						updateTreasureClassRowItemToNoDrop(currTcRow, currMiscItemRow.code);	
					}
				);

			}
			
		}
	
	);
	
}

///////////////////////////////////////////////////////////////////////////////
/////////////////////////// Treasure Classes Functions ////////////////////////
///////////////////////////////////////////////////////////////////////////////

function addTcAtPosition(tcRows, index, newTc) {
  tcRows.splice(index, REMOVE_NO_ELEMENTS, newTc);
}

function updateTcReferences(currRow, oldTcName, newTcName) {
	
	for (let i = 1; i <= 10; i++) {
	  
		const currItemIndex = TC_ITEM_COLUMN_PREFIX + i;
		const currItemName = currRow[currItemIndex];

		if (currItemName != null && currItemName === oldTcName) {
			currRow[currItemIndex] = newTcName;
		}
		
	}
	
}

function generateTcRows(items, treasureClassNumber, tcNamePrefix, rarityNumber, part) {

	if(part === undefined) {
		part = "";
	}

	if(items.length === 0) {
		return {};
	}
	
	log("generateTcRows items.length = " + items.length);
	log("generateTcRows treasureClassNumber = " + treasureClassNumber);
	log("generateTcRows rarityNumber = " + rarityNumber);

	const newTcName = tcNamePrefix + formattedTcNumber(treasureClassNumber) + TC_NAME_SUFFIX + TC_NAME_RARIRY_SUFFIX + rarityNumber + part;
	log("generateTcRows newTcName = " + newTcName);

	if(items.length > 10) {
		
		if(items.length > 20) {
			let s = "";
			items.forEach((item) => s += item.code + "; ");
			throw "More than 20 items for treasureClassNumber = " + treasureClassNumber + "; rarityNumber = " + rarityNumber + "; tcNamePrefix = " + tcNamePrefix + "; newTcName = " + newTcName + "! The items are " + s + "!";
		}
		
		const firstTenItems = items.slice(0, TC_MAX_ITEMS);
		const restItems = items.slice(TC_MAX_ITEMS);
		
		let s1 = "";
		firstTenItems.forEach((item) => s1 += item.code + "; ");
		 
		let s2 = "";
		restItems.forEach((item) => s2 += item.code + "; ");
		
		const firstSubTc = generateTcRows(firstTenItems, treasureClassNumber, tcNamePrefix, rarityNumber, TC_NAME_PART_SUFFIX + 1);
		const secondSubTc = generateTcRows(restItems, treasureClassNumber, tcNamePrefix, rarityNumber, TC_NAME_PART_SUFFIX + 2);

		const newTreasureClassRows = [
			{
				[TC_NAME_COLUMN]: newTcName,
				level: treasureClassNumber,
				Picks: 1,	
				[TC_NO_DROP_COLUMN]: 0,
				Item1: firstSubTc[0][TC_NAME_COLUMN],
				Prob1: firstTenItems.length,
				Item2: secondSubTc[0][TC_NAME_COLUMN],
				Prob2: restItems.length,
			}, 
			firstSubTc[0],
			secondSubTc[0]
		];
		
		return newTreasureClassRows;
			
	}
	
	let newTreasureClassRow = {
		[TC_NAME_COLUMN]: newTcName,
		level: treasureClassNumber,
		Picks: 1,	
	};
	
	let noDropChance = 0;
	for(let i = 0; i < items.length; i++) {
		
		const item = items[i];
		
		log("generateTcRows items[i] = " + itemToString(item));
						
		noDropChance += (item.remove) ? (+item.typeRarity) : (0);
		newTreasureClassRow[TC_ITEM_COLUMN_PREFIX + (i+1)] = item.code;
		newTreasureClassRow[TC_PROBABILITY_COLUMN_PREFIX + (i+1)] = (item.remove) ? (0) : (item.typeRarity);
		
	}
	
	newTreasureClassRow[TC_NO_DROP_COLUMN] = noDropChance;
	
	return [newTreasureClassRow];
	
}

function formattedTcNumber(treasureClassNumber) {
	return (treasureClassNumber > 9) ? ("" + treasureClassNumber) : ("0" + treasureClassNumber);
}

function getTcNamePrefix(itemType, itemSubType) {
	
	if(itemSubType === ITEM_SUB_TYPE_WEAPON_MELEE) {
		return TC_NAME_WEAPON_MELEE_PREFIX;
	}
	
	if(itemSubType === ITEM_SUB_TYPE_WEAPON_MISSILE) {
		return TC_NAME_WEAPON_MISSILE_PREFIX;
	}

	if(itemType === ITEM_TYPE_WEAPON) {
		return TC_NAME_WEAPON_PREFIX;
	}
	
	if(itemType === ITEM_TYPE_ARMOR) {
		return TC_NAME_ARMOR_PREFIX;
	}
	
	throw "Given item type: " + itemType + " is not a known type!";
	
}

function updateTreasureClassRowToFullNoDrop(treasureClassRow) {
    
    for (let i = 1; i <= 10; i++) {
		
        const currItemIndex = 'Item' + i;
		if(treasureClassRow[currItemIndex] !== "") {
			const currItemProbabilityIndex = 'Prob' + i;
			treasureClassRow[currItemProbabilityIndex] = 0;
		}

    }
    
    treasureClassRow[TC_NO_DROP_COLUMN] = 100;
	
}

function updateTreasureClassRowItemToNoDrop(treasureClassRow, itemCode) {
    
	log("updateTreasureClassRowItemToNoDrop treasureClassRow = " + treasureClassRow + "; itemCode = " + itemCode);
	
    for (let i = 1; i <= 10; i++) {
		
        const currItemIndex = 'Item' + i;
        const currItemProbabilityIndex = 'Prob' + i;
    
		if(treasureClassRow[currItemIndex] === itemCode) {
			treasureClassRow[TC_NO_DROP_COLUMN] = intNvl(treasureClassRow[TC_NO_DROP_COLUMN]) + intNvl(treasureClassRow[currItemProbabilityIndex]);
			treasureClassRow[currItemProbabilityIndex] = 0;
		}

    }
    	
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////// Util Functions //////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function isEmpty(obj) {
	
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop)) {
            return false;
		}
    }

    return true;
	
}

function log(message) {
	
	if(LOG_ENABLED) {
		TREASURE_CLASS_EX_FILE.rows.splice(1, 0, {
			[TC_NAME_COLUMN]: "LOG " + (logIndex++) + ": " + message,
		});
	}

}

function intNvl(integer) {
	
	if(integer == null || integer === "") {
		return 0;
	}
	
	return +integer;
	
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////// Config Generation (mod.json) ////////////////////////
///////////////////////////////////////////////////////////////////////////////

function createConfigSectionJson(currTcNumber, itemType) {
	
	return `
		{
		  "id": "TC${currTcNumber} ${itemType}",
		  "type": "section",
		  "name": "Treasure Class ${currTcNumber} ${itemType}",
		  "defaultExpanded": false
		},
	`;
	
}

function createConfigItemJson(itemCode, itemName, itemNameLowerCasePlural, uniqueAndSetItems) {
	
	return `
		{
		  "id": "${itemCode}",
		  "type": "checkbox",
		  "name": "Remove ${itemName}${uniqueAndSetItems}",
		  "description": "Enable to replace ${itemNameLowerCasePlural} with NoDrop",
		  "defaultValue": false
		},
	`;
	
}

function computeLowerCasePluralName(itemName) {
	
	let itemNameLowerCasePlural = itemName.toLowerCase() + "s";
	
	itemNameLowerCasePlural = itemNameLowerCasePlural.replace("glovess", "gloves");
	itemNameLowerCasePlural = itemNameLowerCasePlural.replace("bootss", "boots");
	itemNameLowerCasePlural = itemNameLowerCasePlural.replace("staffs", "staves");
	
	return itemNameLowerCasePlural;
	
}

function getSetOrUniqueItems(searchType, itemName, itemCode) {

	let items;
	if(searchType === CONFIG_ITEM_QUALITY_UNIQUE) {
		items = UNIQUE_ITEMS_FILE.rows.filter((uniqueItem) => uniqueItem.code === itemCode);
	}
	if(searchType === CONFIG_ITEM_QUALITY_SET) {
		items = SET_ITEMS_FILE.rows.filter((setItem) => setItem.item === itemCode);
	}
	
	if(items === undefined) {
		throw "Search type " + searchType + " is unknown! Expected " + CONFIG_ITEM_QUALITY_UNIQUE + " or " + CONFIG_ITEM_QUALITY_SET + "! Item name was " + itemName + "!";
	}

	if(items.length > 2) {
		throw "More than 2 items found searching for item " + itemName + " using search type " + searchType + " and code " + itemCode + "! The First 3 items are: " + items[0].name + "; " + items[1].name + "; " + items[2].name + "!";
	} 

	return items;
	
}

function computeUniqueOrSetItemsList(itemType, items) {
	
	if(items.length === 0) {
		return "";
	}
	
	let itemTypeString;
	if(itemType === CONFIG_ITEM_QUALITY_UNIQUE) {
		itemTypeString = "Unique";
	}
	if(itemType === CONFIG_ITEM_QUALITY_SET) {
		itemTypeString = "Set";
	}
	
	if(itemTypeString === undefined) {
		throw "Item type " + itemType + " is unknown! Expected " + CONFIG_ITEM_QUALITY_UNIQUE + " or " + CONFIG_ITEM_QUALITY_SET + "! Item name was " + itemName + "!";
	}
	
	const firstItemName = ITEM_NAMES_FILE.find((itemNameObj) => itemNameObj.Key === items[0].index).enUS;
	let itemsString = `(${itemTypeString}: ${firstItemName}`;

	if(items.length === 2) {
		const secondItemName = ITEM_NAMES_FILE.find((itemNameObj) => itemNameObj.Key === items[1].index).enUS;
		itemsString += `, ${secondItemName}`;
	}
	
	itemsString += ")";
	
	return itemsString;
	
}

function createConfigItem(item) {
	
	let itemCode = item.code;
	let itemName = item.name;
	let itemNameLowerCasePlural = computeLowerCasePluralName(itemName);
	
	const uniqueItems = getSetOrUniqueItems(CONFIG_ITEM_QUALITY_UNIQUE, itemName, itemCode);
	const uniqueItemsString = computeUniqueOrSetItemsList(CONFIG_ITEM_QUALITY_UNIQUE, uniqueItems);
	
	const setItems = getSetOrUniqueItems(CONFIG_ITEM_QUALITY_SET, itemName, itemCode);
	const setItemsString = computeUniqueOrSetItemsList(CONFIG_ITEM_QUALITY_SET, setItems);
	
	let uniqueAndSetItems = "";
	if(uniqueItemsString !== "") {
		uniqueAndSetItems = " " + uniqueItemsString;
	}
	if(setItemsString !== "") {
		uniqueAndSetItems += " " + setItemsString;
	}

	return createConfigItemJson(itemCode, itemName, itemNameLowerCasePlural, uniqueAndSetItems);
	
}

function generateConfig() {
	
	let json = "{"

	for(let currTcNumber = TC_MIN; currTcNumber <= TC_MAX; currTcNumber += TC_SIZE) {
		
		json += createConfigSectionJson(currTcNumber, CONFIG_ITEM_TYPE_ARMOR);
		
		const armors = getItems(ITEM_TYPE_ARMOR, currTcNumber);
		
		armors.forEach(
			(armor) => json += createConfigItem(armor)
		);
		
		json += "\n";
		
		json += createConfigSectionJson(currTcNumber, CONFIG_ITEM_TYPE_WEAPON);

		const weapons = getItems(ITEM_TYPE_WEAPON, currTcNumber);
				
		weapons.forEach(
			(weapon) => json += createConfigItem(weapon)
		);
		
	}

	json = json.slice(0, -1);
	json += "}";

	log(json);
	
}
