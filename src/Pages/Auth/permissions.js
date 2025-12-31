// utils/permissions.js

export const permissions = {
    ADMIN: '1995', // صلاحية Admin
    WRITER: '1996', // صلاحية Writer
    USER: '2001', // صلاحية User
    productManger:'1999'//صلاحية product manager 
};

// الأدوار التي يمكنها الوصول إلى صفحة معينة
export const allowedRoles = {
    WRITER_PAGE: [permissions.WRITER, permissions.ADMIN], // الصفحات التي يمكن للـ Writer والـ Admin الوصول إليها
    ADMIN_PAGE: [permissions.ADMIN], PRODUCT_MANAGER:[permissions.productManger] // الصفحات التي يمكن للـ Admin فقط الوصول إليها
};