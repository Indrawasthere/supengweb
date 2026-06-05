"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerAction } from "@/server/auth/actions";

const formSchema = z
  .object({
    name: z.string().min(2, { message: "Nama minimal 2 karakter." }),
    email: z.string().email({ message: "Email tidak valid." }),
    role: z.enum(["L2", "LEAD", "L1_TS"]),
    password: z.string().min(6, { message: "Password minimal 6 karakter." }),
    confirmPassword: z.string().min(6),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Password tidak cocok.",
    path: ["confirmPassword"],
  });

const ROLE_OPTIONS = [
  { value: "L2", label: "L2 — Technical Support Engineer" },
  { value: "LEAD", label: "Lead TSE" },
  { value: "L1_TS", label: "L1 — Technical Support" },
] as const;

export default function RegisterV1() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "L2",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      await registerAction(data);
      toast.success("Akun berhasil dibuat!");
      router.push("/dashboard/ticketing-analytics");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registrasi gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-dvh">
      <div className="flex w-full items-center justify-center bg-background p-8 lg:w-2/3">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="font-semibold text-2xl tracking-tight">
              Daftar Akun Supeng Web
            </h2>
            <p className="text-muted-foreground text-sm">
              Khusus anggota tim TSE Parkee
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
                name="name"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="reg-name">Nama Lengkap</FieldLabel>
                    <Input
                      {...field}
                      id="reg-name"
                      placeholder="Muhammad Fadlan"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="reg-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="reg-email"
                      type="email"
                      placeholder="kamu@parkee.app"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="role"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel>Role</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role kamu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {ROLE_OPTIONS.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
                    <FieldLabel htmlFor="reg-pw">Password</FieldLabel>
                    <Input
                      {...field}
                      id="reg-pw"
                      type="password"
                      placeholder="••••••••"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="reg-cpw">
                      Konfirmasi Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="reg-cpw"
                      type="password"
                      placeholder="••••••••"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Mendaftar..." : "Daftar"}
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-xs">
            Sudah punya akun?{" "}
            <Link
              prefetch={false}
              href="/auth/v1/login"
              className="text-primary underline"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden bg-primary lg:flex lg:w-1/3 flex-col items-center justify-center p-12 text-center">
        <div className="space-y-4">
          <div className="text-4xl font-bold text-primary-foreground">🅢</div>
          <h1 className="font-light text-5xl text-primary-foreground">
            Supeng Web
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Daftar dulu,
            <br />
            baru bisa pantau tiket
          </p>
        </div>
      </div>
    </div>
  );
}
