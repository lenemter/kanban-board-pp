export const initialUsers = [
  { 
    id: 'user-1', 
    name: 'Artem Priupolin', 
    email: 'priupolin5443@yandex.ru' 
  },
  { 
    id: 'user-2', 
    name: 'Altan Bambaev', 
    email: 'altanbambaev81@gmail.com' 
  },
  { 
    id: 'user-3', 
    name: 'Leo B. R.', 
    email: 'leo@company.com' 
  },
  { 
    id: 'user-4', 
    name: 'Maria S.', 
    email: 'maria.s@corp.net' 
  },
];

/**
 * Хелпер-функция для создания нового пользователя (используется в модальном окне)
 */
export const addNewUser = (email) => {
  const newId = `user-${Date.now()}`;
  // Генерируем простое имя из части email до символа @
  const nameFromEmail = email.split('@')[0]; 
  
  return {
    id: newId,
    // Делаем первую букву заглавной
    name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1), 
    email: email,
  };
};