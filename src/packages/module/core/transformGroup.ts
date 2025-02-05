export enum TransformGroup {
    LIST = 'LIST',
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
    ADMINISTRATOR = 'ADMINISTRATOR',
}

export let TRANSFORM_SINGLE = [TransformGroup.PRIVATE, TransformGroup.PUBLIC];
export let TRANSFORM_PRIVATE = [TransformGroup.PRIVATE];

export let AdministratorTransformGroups = [TransformGroup.ADMINISTRATOR, TransformGroup.PRIVATE];

