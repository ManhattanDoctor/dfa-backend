export enum TransformGroup {
    LIST = 'LIST',
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
    ADMINISTRATOR = 'ADMINISTRATOR',
}

export const TRANSFORM_SINGLE = [TransformGroup.PRIVATE, TransformGroup.PUBLIC];
export const TRANSFORM_PRIVATE = [TransformGroup.PRIVATE];
export const TRANSFORM_ADMINISTRATOR = [TransformGroup.ADMINISTRATOR, TransformGroup.PRIVATE];

