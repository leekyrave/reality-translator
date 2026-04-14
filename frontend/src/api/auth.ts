import {apiClient} from "./client";
import type {RegisterBody, LoginBody} from "../types";

export const authApi = {
    register: async (data: RegisterBody) => {
        const res = await apiClient.post("auth/register", data);
        return res;
    },
    login: async (data: LoginBody) => {
        const res = await apiClient.post("auth/login", data);
        return res;
    },

    logout: async () => {
        await apiClient.post("auth/logout", {}); //back request to del cookie
    }

};