export interface Cliente {
    id?: number;
    dni: string;
    nombre: string;
    apellido: string;
    email: string;
    password?: string;
    telefono: string;
}