import supabase from "@/lib/supabase";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

function useCloudStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { user, isAuthenticated } = useAuth0();

  // Data fetching effect
  useEffect(() => {
    if (!isAuthenticated || !user?.sub) return;
    
    const userKey = `${user.sub}:${key}`;
    setLoading(true);

    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('user_data')
          .select('value')
          .eq('key', userKey)
          .single();

        if (error) {
          if (error.code === 'PGRST116' || error.code === 'PGRST204') {
            // We already checked for user?.sub in the parent useEffect
            // TypeScript just needs a reminder
            if (!user?.sub) {
              throw new Error('User not authenticated');
            }
            
            await supabase
              .from('user_data')
              .upsert({ 
                key: userKey,
                value: JSON.stringify(initialValue),
                user_id: user.sub 
              });
            return { data: null };
          }
          throw error;
        }

        return { data };
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        const localData = localStorage.getItem(key);
        setStoredValue(localData ? JSON.parse(localData) : initialValue);
        return { data: null };
      } finally {
        setLoading(false);
      }
    }

    fetchData().then(({ data }) => {
      setStoredValue(data ? JSON.parse(data.value) : initialValue);
    });
  }, [key, user?.sub, isAuthenticated]);

  // Subscription effect
  useEffect(() => {
    if (!isAuthenticated || !user?.sub) return;

    const userKey = `${user.sub}:${key}`;
    const subscription = supabase
      .channel('user_data_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_data',
        filter: `key=eq.${userKey}`
      }, payload => {
        if (payload.new && 'value' in payload.new && payload.new.value) {
          setStoredValue(JSON.parse(payload.new.value));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [key, user?.sub, isAuthenticated]);

  const setValue = async (value: T | ((val: T) => T)) => {
    if (!isAuthenticated || !user?.sub) {
      throw new Error('Not authenticated');
    }

    const userKey = `${user.sub}:${key}`;
    const newValue = value instanceof Function ? value(storedValue) : value;
    
    setStoredValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));

    await supabase
      .from('user_data')
      .upsert({
        key: userKey,
        value: JSON.stringify(newValue),
        user_id: user.sub
      });
  };

  return { value: storedValue, setValue, loading, error } as const;
}

export { useCloudStorage };
