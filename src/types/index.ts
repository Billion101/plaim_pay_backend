export interface RegisterUserDto {
    first_name: string;
    last_name: string;
    phone: string;
    password: string;
    plam_code?: string;
}

export interface LoginDto {
    phone: string;
    password: string;
}

export interface CreateOrderDto {
    amount: number;
    description?: string;
    items?: any;
}

export interface TopUpDto {
    amount: number;
}

export interface VerifyPalmDto {
    plam_code: string;
}
