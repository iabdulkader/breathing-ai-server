export interface CustomerToAdd {
    firstName: string;
    lastName: string;
    email: string;
    department: string;
}


export interface CustomerWithId extends CustomerToAdd {
    id: string;
    userId?: string;
}