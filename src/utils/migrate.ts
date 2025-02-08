import supabase from "@/lib/supabase";
import { User } from "@auth0/auth0-react";

async function migrateLocalStorageToCloud(user: User) {
    const migrationKey = `${user.sub}:migration_completed`;
    if (localStorage.getItem(migrationKey)) return;
  
    const keys = ['students', 'lessons', 'classes'];
    
    for (const key of keys) {
      const localData = localStorage.getItem(key);
      if (!localData) continue;
  
      const userKey = `${user.sub}:${key}`;
      await supabase
        .from('user_data')
        .upsert({
          key: userKey,
          value: localData,
          user_id: user.sub
        });
    }
  
    localStorage.setItem(migrationKey, 'true');
  }

  export { migrateLocalStorageToCloud };
