import { IKeycloakTokenContent, IKeycloakTokenHeader, KeycloakAccessToken } from "@ts-core/openid-common";
import { IOpenIdAttributes } from "./OpenIdGuard";
import { UserStatus } from "@project/common/platform/user";

export interface IOpenIdTokenHeader extends IKeycloakTokenHeader { }

export interface IOpenIdTokenContent extends IOpenIdAttributes, IKeycloakTokenContent { }

export class OpenIdToken extends KeycloakAccessToken<IOpenIdTokenHeader, IOpenIdTokenContent> {
    public get id(): string {
        return this.content.sub;
    }
    public get status(): UserStatus {
        return this.content.status;
    }
}
