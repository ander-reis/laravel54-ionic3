import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {JwtClientProvider} from "../jwt-client/jwt-client";
import {JwtPayload} from "../../models/jwt-payload";
import {Facebook, FacebookLoginResponse} from "@ionic-native/facebook";
import {UserResourceProvider} from "../user-resource/user.resource";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {UserModel} from "../sqlite/user.model";
import {AuthGuard} from "./auth-guard";
import {AppConfigProvider} from "../app-config/app-config";

/*
  Generated class for the AuthProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AuthProvider implements AuthGuard{

    private _user = null;
    private _userSubject = new BehaviorSubject(null);

    constructor(public jwtClient: JwtClientProvider,
                public fb: Facebook,
                public userResource: UserResourceProvider,
                public userModel: UserModel,
                public appConfig: AppConfigProvider) {
    }

    //verifica a mudança em user
    userSubject():BehaviorSubject<Object>{
        return this._userSubject;
    }

    //metodo para carregar dados do usuário
    user(): Promise<Object> {
        return new Promise((resolve) => {
            if (this._user) {
                resolve(this._user);
            }

            this.jwtClient.getPayload().then((payload: JwtPayload) => {
                if (payload) {
                    this._user = payload.user;
                    this._userSubject.next(this._user);
                }
                resolve(this._user);
            });
        });
    }

    //verifica se usuario está logado
    check(): Promise<boolean> {
        return this.user().then(user => {
            return user !== null;
        })
    }

    //metodo responsavel pelo login
    login({email, password}): Promise<Object> {
        return this.jwtClient.accessToken({email, password})
            .then(() => {
                return this.appConfig.setOff(false);
            })
            .then(() => {
                return this.user().then(user => {
                    this.saveUser(user);
                    return user;
                });
            });
    }

    //save user offline
    private saveUser(user){
        this.userModel.save(user);
    }

    //login facebook
    loginFacebook(): Promise<Object> {
        return this.fb.login(['email'])
            .then((response: FacebookLoginResponse) => {
                let accessToken = response.authResponse.accessToken;
                return this.userResource
                    .register(accessToken)
                    .then(token => {
                        this.jwtClient.setToken(token);
                        return this.user();
                    });
            });
    }

    refresh(): Promise<Object> {
        return this.jwtClient.refreshToken().then(() => {
            return this.user();
        })
    }

    //metodo responsavel pelo logout
    logout(): Promise<any> {
        return this.jwtClient.revokeToken().then(() => {
            this._user = null;
            this._userSubject.next(this._user);
        });
    }
}
