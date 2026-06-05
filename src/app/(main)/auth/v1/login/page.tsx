"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/server/auth/actions";

const formSchema = z.object({
  email: z.string().email({ message: "Email tidak valid." }),
  password: z.string().min(6, { message: "Password minimal 6 karakter." }),
});

export default function LoginV1() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") ?? "/dashboard/ticketing-analytics";
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      await loginAction(data);
      toast.success("Login berhasil!");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-dvh">
      {/* Left panel — branding */}
      <div className="hidden bg-primary lg:flex lg:w-1/3 flex-col items-center justify-center p-12 text-center">
        <div className="space-y-4">
          <div className="text-4xl font-bold text-primary-foreground">🅢</div>
          <h1 className="font-light text-5xl text-primary-foreground">
            Supeng Web
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Technical Support Engineer Dashboard
            <br />
            <span className="text-sm opacity-70">Parkee — L2 Division</span>
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center bg-background p-8 lg:w-2/3">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="font-semibold text-2xl tracking-tight">
              Masuk ke Supeng Web
            </h2>
            <p className="text-muted-foreground text-sm">
              Masukkan kredensial akun divisi TSE kamu
            </p>
          </div>

          <form
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FieldGroup className="gap-4">
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="login-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="login-email"
                      type="email"
                      placeholder="xxx@parkee.app"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="login-password">Password</FieldLabel>
                    <Input
                      {...field}
                      id="login-password"
                      type="password"
                      placeholder=""
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Masuk..." : "Masuk"}
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-xs">
            Belum punya akun?{" "}
            <Link
              prefetch={false}
              href="/auth/v1/register"
              className="text-primary underline"
            >
              Daftar dulu
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
