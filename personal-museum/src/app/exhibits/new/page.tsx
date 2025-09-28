"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewExhibitPage() {
	const router = useRouter()
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function onSubmit(formData: FormData) {
		setSubmitting(true)
		setError(null)
		try {
			const res = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			})
			if (!res.ok) {
				const data = await res.json().catch(() => ({}))
				throw new Error(data.error || 'Failed to create exhibit')
			}
			const { exhibit } = await res.json()
			router.push(`/exhibits/${exhibit.id}`)
		} catch (e: any) {
			setError(e.message || 'Something went wrong')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="max-w-2xl mx-auto p-6 space-y-6">
			<h1 className="text-2xl font-semibold">New Exhibit</h1>
			{error && (
				<div className="rounded border border-red-300 bg-red-50 text-red-700 p-3 text-sm">
					{error}
				</div>
			)}
			<form action={onSubmit} className="space-y-4">
				<div>
					<label className="block text-sm font-medium">Title</label>
					<input name="title" required className="mt-1 w-full rounded border p-2" />
				</div>
				<div>
					<label className="block text-sm font-medium">Description</label>
					<textarea name="description" rows={4} className="mt-1 w-full rounded border p-2" />
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium">Year</label>
						<input type="number" name="year" className="mt-1 w-full rounded border p-2" />
					</div>
					<div>
						<label className="block text-sm font-medium">Tags (comma-separated)</label>
						<input name="tags" placeholder="painting, oil, portrait" className="mt-1 w-full rounded border p-2" />
					</div>
				</div>
				<div>
					<label className="block text-sm font-medium">Image</label>
					<input type="file" name="image" accept="image/*" required className="mt-1 w-full" />
				</div>
				<div className="flex gap-3">
					<button disabled={submitting} type="submit" className="rounded bg-black text-white px-4 py-2 disabled:opacity-50">
						{submitting ? 'Saving…' : 'Create'}
					</button>
					<button type="button" className="rounded border px-4 py-2" onClick={() => router.back()}>
						Cancel
					</button>
				</div>
			</form>
		</div>
	)
}