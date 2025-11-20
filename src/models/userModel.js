export function createUserModel({
  name,
  email,
  passwordHash,
  permissions = {}
}) {
  return {
    id: null,
    name,
    email,
    passwordHash,
    permissions: {
      canCreateBook: !!permissions.canCreateBook,
      canUpdateBook: !!permissions.canUpdateBook,
      canDeleteBook: !!permissions.canDeleteBook,
      canUpdateUser: !!permissions.canUpdateUser,
      canDeleteUser: !!permissions.canDeleteUser,
      canReadUsers: !!permissions.canReadUsers
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
