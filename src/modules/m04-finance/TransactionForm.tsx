import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionFormSchema, type TransactionFormData } from '@/lib/validators'
import { useCreateTransaction } from '@/lib/queries'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { todayISO } from '@/lib/utils'

const TYPE_OPTIONS = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
]

const CATEGORY_OPTIONS = [
  { value: 'food_cost', label: 'Food Cost' },
  { value: 'labour', label: 'Labour' },
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'other', label: 'Other' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function TransactionForm({ isOpen, onClose }: Props) {
  const createTransaction = useCreateTransaction()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema) as never,
    defaultValues: { type: 'expense', category: 'other', date: todayISO() },
  })

  const onSubmit = async (data: TransactionFormData) => {
    await createTransaction.mutateAsync({
      type: data.type,
      category: data.category,
      amount: data.amount,
      description: data.description ?? null,
      reference: data.reference ?? null,
      date: data.date,
      receipt_url: null,
    })
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Transaction" size="md">
      <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
        <Select label="Type" options={TYPE_OPTIONS} error={errors.type?.message} {...register('type')} />
        <Select label="Category" options={CATEGORY_OPTIONS} error={errors.category?.message} {...register('category')} />
        <Input
          label="Amount (£)"
          type="number"
          step="0.01"
          min="0"
          error={errors.amount?.message}
          {...register('amount')}
        />
        <Input label="Date" type="date" error={errors.date?.message} {...register('date')} />
        <Input label="Description" placeholder="What is this for?" error={errors.description?.message} {...register('description')} />
        <Input label="Reference" placeholder="Invoice / receipt ref" error={errors.reference?.message} {...register('reference')} />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>Save Transaction</Button>
        </div>
      </form>
    </Modal>
  )
}
