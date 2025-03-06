import { jwtDecode } from "jwt-decode";

export function classNames(...classes : string[]) {
    return classes.filter(Boolean).join(' ')
}

export function isValidUrl(url: string) {
    try {
        new URL(url)
        return true
    } catch (error) {
        return false
    }
}

export function decodeJWT<T>(token: string): T {
    return jwtDecode<T>(token);
}