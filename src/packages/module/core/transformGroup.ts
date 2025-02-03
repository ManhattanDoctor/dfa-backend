export enum TransformGroup {
    LIST = 'LIST',
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
    ADMINISTRATOR = 'ADMINISTRATOR',
}

export let TRANSFORM_SINGLE = [TransformGroup.PRIVATE, TransformGroup.PUBLIC];

export let AdministratorTransformGroups = [TransformGroup.ADMINISTRATOR, TransformGroup.PRIVATE];

