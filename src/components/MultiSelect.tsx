'use client'

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'


interface Option {
    label: string
    value: string
}

interface MultiSelectProps {
    options: Option[]
    values: string[]
    onChange: (values: string[]) => void
    placeholder?: string
    disabled?: boolean
}

export function MultiSelect({
                                options,
                                values,
                                onChange,
                                placeholder = 'Select...',
                                disabled = false,
                            }: MultiSelectProps) {
    const toggleValue = (val: string) => {
        if (values.includes(val)) {
            onChange(values.filter((v) => v !== val))
        } else {
            onChange([...values, val])
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                    disabled={disabled}
                >
                    {values.length > 0
                        ? `${values.length} selected`
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => toggleValue(option.value)}
                                    className="cursor-pointer"
                                >
                                    <div className="mr-2">
                                        {values.includes(option.value) ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <span className="h-4 w-4 inline-block" />
                                        )}
                                    </div>
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
