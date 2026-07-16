import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { getItemAsync, setItemAsync } from 'expo-secure-store';
import z from 'zod';
import { rpcEndpoint, ssiClient, ssiCredentialsSecureStorageKey, ssiTokenSecureStorageKey } from './api';

const ssiCredentialsSecureStorageSchema = z.object({
  username: z.string(),
  password: z.string(),
});

type SSICredentialsSecureStorage = z.infer<typeof ssiCredentialsSecureStorageSchema>;

export interface Authenticated {
  authenticated_alpha: boolean;
  authenticated_beta: boolean;
  authenticated_rental: boolean;
  authenticated: true;
  authenticated_message: string;
  error_message_url: boolean;
  error_message: boolean;
  mid: number;
  token: string;
  can_change_mares_firmware_endpoint: boolean;
  imperial: boolean;
  privacy_info: Date;
  privacy_required: boolean;
  marketing_required: boolean;
  privacy_settings_required: boolean;
  authenticated_email: string;
}

export interface AuthenticationError {
  authenticated_alpha: boolean;
  authenticated_beta: boolean;
  authenticated_rental: boolean;
  authenticated: false;
  authenticated_message: string;
  error_message_url: boolean;
  error_message: string;
  can_change_mares_firmware_endpoint: boolean;
}

export function loginMutationOptions() {
  return mutationOptions({
    mutationFn: async (options: { username: string; password: string }) => {
      return await ssiClient.get<Authenticated | AuthenticationError>(rpcEndpoint, {
        params: {
          what: 'authenticate',
          l: options.username,
          p: options.password,
        },
      });
    },
    onSuccess: async (result, _variables, _mutateResult, context) => {
      if (result.data.authenticated) {
        await setItemAsync(ssiTokenSecureStorageKey, result.data.token);
        await setItemAsync(
          ssiCredentialsSecureStorageKey,
          JSON.stringify(_variables satisfies SSICredentialsSecureStorage),
        );
        await context.client.invalidateQueries({
          exact: false,
          queryKey: ['ssi'],
        });
      }
    },
  });
}

export function ssiCredentialsOptions() {
  return queryOptions({
    queryKey: ['ssi', 'credentials'],
    queryFn: async (): Promise<SSICredentialsSecureStorage> => {
      const data = await getItemAsync(ssiCredentialsSecureStorageKey);
      if (!data) {
        return {
          username: '',
          password: '',
        };
      }
      const result = ssiCredentialsSecureStorageSchema.safeParse(JSON.parse(data));
      if (result.success) {
        return result.data;
      } else {
        return {
          username: '',
          password: '',
        };
      }
    },
  });
}
