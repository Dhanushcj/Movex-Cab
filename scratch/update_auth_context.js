const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\src\\\\context\\\\AuthContext.tsx';
let content = fs.readFileSync(path, 'utf8');

const updateProfileFunc = `
  const updateProfile = async (data: any): Promise<boolean> => {
    try {
      const endpoint = user?.role === 'driver' ? '/drivers/profile' : '/users/me';
      const response = await API.put(endpoint, data);
      if (response.data.success) {
        setUser(response.data.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  };
`;

if (!content.includes('updateProfile: (data: any) => Promise<boolean>;')) {
  content = content.replace(
    'updateOnlineStatus: (status: boolean) => Promise<boolean>;',
    'updateOnlineStatus: (status: boolean) => Promise<boolean>;\n  updateProfile: (data: any) => Promise<boolean>;'
  );
  
  content = content.replace(
    'const updateUserWallet = async (amount: number): Promise<number> => {',
    updateProfileFunc + '\n  const updateUserWallet = async (amount: number): Promise<number> => {'
  );
  
  content = content.replace(
    'updateOnlineStatus,',
    'updateOnlineStatus,\n    updateProfile,'
  );
  
  fs.writeFileSync(path, content, 'utf8');
  console.log('AuthContext updated with updateProfile');
}
