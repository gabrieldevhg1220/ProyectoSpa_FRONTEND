export interface Empleado {
    id?: number;
    dni: string;
    nombre: string;
    apellido: string;
    email: string;
    password?: string;
    telefono: string;
    rol: string;
}

// export enum Rol {
//     ESTETICISTA = 'ESTETICISTA',
//     TECNICO_ESTETICA_AVANZADA = 'TECNICO_ESTETICA_AVANZADA',
//     ESPECIALISTA_CUIDADO_UNAS = 'ESPECIALISTA_CUIDADO_UNAS',
//     MASAJISTA_TERAPEUTICO = 'MASAJISTA_TERAPEUTICO',
//     TERAPEUTA_SPA = 'TERAPEUTA_SPA',
//     COORDINADOR_AREA = 'COORDINADOR_AREA',
//     RECEPCIONISTA = 'RECEPCIONISTA',
//     GERENTE_GENERAL = 'GERENTE_GENERAL',
//     INSTRUCTOR_YOGA = 'INSTRUCTOR_YOGA',
//     NUTRICIONISTA = 'NUTRICIONISTA'
// }