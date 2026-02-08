"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressTypeEnum = exports.OrderPaymentStatusEnum = exports.OrderStatusEnum = exports.UserRoleEnum = void 0;
var UserRoleEnum;
(function (UserRoleEnum) {
    UserRoleEnum["CUSTOMER"] = "CUSTOMER";
    UserRoleEnum["ADMIN"] = "ADMIN";
    UserRoleEnum["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserRoleEnum || (exports.UserRoleEnum = UserRoleEnum = {}));
var OrderStatusEnum;
(function (OrderStatusEnum) {
    OrderStatusEnum["PENDING"] = "PENDING";
    OrderStatusEnum["CONFIRMED"] = "CONFIRMED";
    OrderStatusEnum["PROCESSING"] = "PROCESSING";
    OrderStatusEnum["SHIPPED"] = "SHIPPED";
    OrderStatusEnum["DELIVERED"] = "DELIVERED";
    OrderStatusEnum["CANCELLED"] = "CANCELLED";
    OrderStatusEnum["RETURNED"] = "RETURNED";
})(OrderStatusEnum || (exports.OrderStatusEnum = OrderStatusEnum = {}));
var OrderPaymentStatusEnum;
(function (OrderPaymentStatusEnum) {
    OrderPaymentStatusEnum["PENDING"] = "PENDING";
    OrderPaymentStatusEnum["PAID"] = "PAID";
    OrderPaymentStatusEnum["FAILED"] = "FAILED";
    OrderPaymentStatusEnum["REFUNDED"] = "REFUNDED";
})(OrderPaymentStatusEnum || (exports.OrderPaymentStatusEnum = OrderPaymentStatusEnum = {}));
var AddressTypeEnum;
(function (AddressTypeEnum) {
    AddressTypeEnum["BILLING"] = "BILLING";
    AddressTypeEnum["SHIPPING"] = "SHIPPING";
    AddressTypeEnum["BOTH"] = "BOTH";
})(AddressTypeEnum || (exports.AddressTypeEnum = AddressTypeEnum = {}));
//# sourceMappingURL=dtos.js.map