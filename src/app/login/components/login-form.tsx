'use client'

import { GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useFormik } from "formik";
import * as y from "yup";
import { useAuthActions } from "@/lib/auth/useAuthAction";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const { login } = useAuthActions();
  const schema = y.object({
    nik: y.string().required("NIK wajib diisi"),
    password: y.string().required("Password wajib diisi"),
  });

  const {
    values: { nik, password },
    errors,
    dirty,
    isValid,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormik({
    initialValues: {
      nik: "",
      password: "",
    },
    validationSchema: schema,
    onSubmit: async () => {
      try {
        await login.mutateAsync({ nik, password, callbackUrl: "/dashboard" });
      } catch (err: any) {
      }
    },
  });

  return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <a href="#" className="flex flex-col items-center gap-2 font-medium">
                <div className="flex size-8 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-6" />
                </div>
                <span className="sr-only">AMS.</span>
              </a>
              <h1 className="text-xl font-bold">Welcome to AMS Task-Manager.</h1>
            </div>

            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="nik">
                  NIK{" "}
                  {touched.nik && errors.nik && (
                      <span className="text-red-500 text-xs italic">*{errors.nik}</span>
                  )}
                </Label>
                <Input
                    id="nik"
                    type="text"
                    placeholder="141183091"
                    value={nik}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">
                  Password{" "}
                  {touched.password && errors.password && (
                      <span className="text-red-500 text-xs italic">*{errors.password}</span>
                  )}
                </Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="******"
                    value={password}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                />
              </div>

              <Button
                  type="submit"
                  className="w-full"
                  disabled={!isValid || !dirty || login.isPending}
              >
                {login.isPending ? (
                    <Spinner variant="default">Loading...</Spinner>
                ) : (
                    "Login"
                )}
              </Button>

              <div className="text-center text-sm">
                Can&apos;t remember your password?
                <a href="/forgot-password" className="underline underline-offset-4 px-2">
                  Reset it here
                </a>
              </div>
            </div>

            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">Or</span>
            </div>

            <div className="text-center text-sm">
              Don&apos;t have an account?
              <a href="#" className="underline underline-offset-4 px-2">
                Sign up
              </a>
            </div>
          </div>
        </form>
      </div>
  );
}
