"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BEHAVIOR_WEIGHTS = void 0;
const enums_1 = require("../constants/enums");
// --- Weight mapping cho CF ---
exports.BEHAVIOR_WEIGHTS = {
    [enums_1.BehaviorAction.VIEW]: 1.0,
    [enums_1.BehaviorAction.SEARCH]: 1.5,
    [enums_1.BehaviorAction.ADD_TO_CART]: 3.0,
    [enums_1.BehaviorAction.REMOVE_FROM_CART]: -1.0,
    [enums_1.BehaviorAction.WISHLIST]: 3.5,
    [enums_1.BehaviorAction.REVIEW]: 4.0,
    [enums_1.BehaviorAction.PURCHASE]: 5.0,
    [enums_1.BehaviorAction.SHARE]: 2.0,
};
