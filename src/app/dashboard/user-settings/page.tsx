'use client'
// import UserForm from "@/app/dashboard/user-settings/components/UserForm";
import ChangePasswordForm from "@/app/dashboard/user-settings/components/ChangePasswordForm";

export default function Page() {
    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="flex flex-col gap-4 px-4 lg:px-6">
                        {/* Profile Form */}
                        {/*<UserForm />*/}

                        {/* Change Password Form */}
                        <ChangePasswordForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
