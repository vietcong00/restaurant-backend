export enum AssetType {
    SOFTWARE = 'software',
    HARDWARE = 'hardware',
}

export enum RequestAssetStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    DONE = 'done',
    PROCESSING = 'processing',
}

export const PRICE = 'price';

export const MAX_REQUEST_QUANTITY = 10000;

export enum RequestAssetOrderBy {
    NAME = 'name',
    PRICE = 'price',
    CREATED_AT = 'createdAt',
    STATUS = 'status',
}
