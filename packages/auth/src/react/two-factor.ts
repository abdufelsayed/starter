import type { BetterAuthClient } from "./client";
import { createMutation } from "./utils";

const KEY = ["auth", "twoFactor"] as const;

export function createTwoFactorModule(client: BetterAuthClient) {
  return {
    key: () => [...KEY],

    enable: createMutation({
      key: [...KEY, "enable"],
      mutationFn: async (data: { password: string }) => {
        const result = await client.twoFactor.enable({
          password: data.password,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    disable: createMutation({
      key: [...KEY, "disable"],
      mutationFn: async (data: { password: string }) => {
        const result = await client.twoFactor.disable({
          password: data.password,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    getTotpUri: createMutation({
      key: [...KEY, "getTotpUri"],
      mutationFn: async (data: { password: string }) => {
        const result = await client.twoFactor.getTotpUri({
          password: data.password,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    verifyTOTP: createMutation({
      key: [...KEY, "verifyTOTP"],
      mutationFn: async (data: { code: string; trustDevice?: boolean }) => {
        const result = await client.twoFactor.verifyTotp({
          code: data.code,
          trustDevice: data.trustDevice,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    sendOTP: createMutation({
      key: [...KEY, "sendOTP"],
      mutationFn: async () => {
        const result = await client.twoFactor.sendOtp();
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    verifyOTP: createMutation({
      key: [...KEY, "verifyOTP"],
      mutationFn: async (data: { code: string; trustDevice?: boolean }) => {
        const result = await client.twoFactor.verifyOtp({
          code: data.code,
          trustDevice: data.trustDevice,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    generateBackupCodes: createMutation({
      key: [...KEY, "generateBackupCodes"],
      mutationFn: async (data: { password: string }) => {
        const result = await client.twoFactor.generateBackupCodes({
          password: data.password,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    verifyBackupCode: createMutation({
      key: [...KEY, "verifyBackupCode"],
      mutationFn: async (data: { code: string; trustDevice?: boolean }) => {
        const result = await client.twoFactor.verifyBackupCode({
          code: data.code,
          trustDevice: data.trustDevice,
        });
        if (result.error) throw result.error;
        return result.data;
      },
    }),
  };
}
