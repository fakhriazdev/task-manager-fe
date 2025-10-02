'use client'

import { Formik, Form, Field, ErrorMessage } from 'formik'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from 'react'
import { Eye, EyeOff } from "lucide-react"
import {changePasswordSchema, ChangePasswordValues} from "@/app/dashboard/user-settings/schemas/changePasswordSchema";
import {useChangePasswordUser} from "@/lib/user/useUserAction";
import {useAuthStore} from "@/lib/stores/useAuthStore";

export default function ChangePasswordForm() {
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const changePasswordMutation = useChangePasswordUser()
    const {user} = useAuthStore()

    return (
        <Formik<ChangePasswordValues>
            initialValues={{
                current: '',
                new: '',
                confirm: ''
            }}
            validationSchema={changePasswordSchema}
            onSubmit={(values, { setSubmitting, resetForm }) => {
                changePasswordMutation.mutate(
                    {
                        nik: user!.nik,
                        currentPassword: values.current,
                        newPassword: values.new,
                    },
                    {
                        onSettled: () => {
                            setSubmitting(false)
                        },
                        onSuccess: () => {
                            resetForm()
                        }
                    }
                )
            }}
        >
            {({ isSubmitting }) => (
                <Form className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-medium">Change Password</h2>

                    {/* Current password with toggle */}
                    <div className="space-y-2">
                        <Label htmlFor="current">Current Password</Label>
                        <div className="relative">
                            <Field
                                as={Input}
                                id="current"
                                name="current"
                                type={showCurrent ? "text" : "password"}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                            >
                                {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        <ErrorMessage name="current" component="div" className="text-red-500 text-sm" />
                    </div>

                    {/* New password with toggle */}
                    <div className="space-y-2">
                        <Label htmlFor="new">New Password</Label>
                        <div className="relative">
                            <Field
                                as={Input}
                                id="new"
                                name="new"
                                type={showNew ? "text" : "password"}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                            >
                                {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        <ErrorMessage name="new" component="div" className="text-red-500 text-sm" />
                    </div>

                    {/* Confirm password (tetap hidden biasa) */}
                    <div className="space-y-2">
                        <Label htmlFor="confirm">Confirm New Password</Label>
                        <Field as={Input} id="confirm" name="confirm" type="password" />
                        <ErrorMessage name="confirm" component="div" className="text-red-500 text-sm" />
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Password'}
                    </Button>
                </Form>
            )}
        </Formik>
    )
}
