"use client";

import { type ReactNode, useActionState, useEffect, useRef } from "react";

export type AdminNewsFormState = Readonly<{
  message: string;
  nonce: string;
  status: "idle" | "error";
}>;

type AdminNewsFormProps = Readonly<{
  action: (state: AdminNewsFormState, formData: FormData) => Promise<AdminNewsFormState>;
  children: ReactNode;
}>;

const initialState: AdminNewsFormState = {
  message: "",
  nonce: "",
  status: "idle"
};

export default function AdminNewsForm({ action, children }: AdminNewsFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const alertedNonceRef = useRef("");

  useEffect(() => {
    if (state.status !== "error" || !state.message || state.nonce === alertedNonceRef.current) {
      return;
    }

    alertedNonceRef.current = state.nonce;
    window.alert(state.message);
  }, [state.message, state.nonce, state.status]);

  return (
    <form action={formAction} aria-busy={isPending} className="space-y-6">
      {children}
    </form>
  );
}
