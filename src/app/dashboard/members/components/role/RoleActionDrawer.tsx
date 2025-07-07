import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Role, roleSchema } from '../../data/schemas'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { roleForm } from '../../data/roleForm'
import {useAddRole, useUpdateRole} from "@/lib/roles/useRolesAction";

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: Role
}

const schema = roleSchema.pick({ id: true, nama: true })

export default function RoleActionDrawer({ open, onOpenChange, currentRow }: Props) {
    const { mutate: updateRole } = useUpdateRole();
    const {mutate: addRole} = useAddRole()
    const isUpdate = !!currentRow
    const initialValues = {
        id: currentRow?.id || '',
        nama: currentRow?.nama || '',
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className='flex flex-col'>
                <SheetHeader className='text-left'>
                    <SheetTitle>{isUpdate ? 'Update' : 'Create'} Roles</SheetTitle>
                    <SheetDescription>
                        {isUpdate
                            ? 'Update the Role '
                            : 'Add a new Role'}
                        Click save when you&#39;re done.
                    </SheetDescription>
                </SheetHeader>

                <Formik
                    initialValues={initialValues}
                    validate={roleForm(schema)}
                    onSubmit={(values, actions) => {
                        if (isUpdate) {
                            updateRole(
                                { id: currentRow.id, data: values },
                                {
                                    onSuccess: () => {
                                        actions.setSubmitting(false);
                                        onOpenChange(false);
                                    },
                                    onError: () => {
                                        actions.setSubmitting(false);
                                    }
                                }
                            );
                        } else {
                            addRole(
                                { data: values },
                                {
                                    onSuccess: () => {
                                        actions.setSubmitting(false);
                                        onOpenChange(false);
                                    },
                                    onError: () => {
                                        actions.setSubmitting(false);
                                    }
                                }
                            );
                        }
                    }}
                >
                    {({ isSubmitting, isValid, dirty, errors, touched }) => (
                        <Form id="tasks-form" className="flex flex-col gap-4 px-4">
                            <div>
                                <label htmlFor="id" className="text-sm font-medium">ID Role</label>
                                <Field
                                    name="id"
                                    type="text"
                                    className={`mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${
                                        touched.id && errors.id ? 'border-red-500' : 'border-gray-300'
                                    }`}

                                />
                                <ErrorMessage
                                    name="id"
                                    component="div"
                                    className="text-sm text-red-500 mt-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="nama" className="text-sm font-medium">Role Name</label>
                                <Field
                                    name="nama"
                                    type="text"
                                    className={`mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${
                                        touched.nama && errors.nama ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <ErrorMessage
                                    name="nama"
                                    component="div"
                                    className="text-sm text-red-500 mt-1"
                                />
                            </div>

                            <SheetFooter className='gap-2 mt-auto'>
                                <SheetClose asChild>
                                    <Button variant='outline' type="button">Close</Button>
                                </SheetClose>
                                <Button type='submit' disabled={isSubmitting || !isValid || !dirty}>
                                    {isUpdate ? 'Update' : 'Create'}
                                </Button>
                            </SheetFooter>
                        </Form>
                    )}
                </Formik>
            </SheetContent>
        </Sheet>
    )
}
