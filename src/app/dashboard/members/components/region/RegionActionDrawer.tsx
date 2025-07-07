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
import { Region, regionSchema } from '../../data/schemas'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { roleForm } from '../../data/roleForm'
import {useAddRegion, useUpdateRegion} from "@/lib/region/useRegionAction";


interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: Region
}

const schema = regionSchema.pick({ id: true, region: true })

export default function RegionActionDrawer({ open, onOpenChange, currentRow }: Props) {
    const {mutate: updateRegion} =useUpdateRegion()
     const {mutate: addRegion} = useAddRegion()
    const isUpdate = !!currentRow
    const initialValues = {
        id: currentRow?.id || '',
        region: currentRow?.region || '',
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className='flex flex-col'>
                <SheetHeader className='text-left'>
                    <SheetTitle>{isUpdate ? 'Update' : 'Create'} Region</SheetTitle>
                    <SheetDescription>
                        {isUpdate
                            ? 'Update the Region '
                            : 'Add a new Region'}
                        Click save when you&#39;re done.
                    </SheetDescription>
                </SheetHeader>

                <Formik
                    initialValues={initialValues}
                    validate={roleForm(schema)}
                    onSubmit={(values, actions) => {
                        if (isUpdate) {
                            updateRegion(
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
                            addRegion(
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
                                <label htmlFor="id" className="text-sm font-medium">Code Region</label>
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
                                <label htmlFor="region" className="text-sm font-medium">Region Name</label>
                                <Field
                                    name="region"
                                    type="text"
                                    className={`mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${
                                        touched.region && errors.region ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <ErrorMessage
                                    name="region"
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
