import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getExhibit(id: number) {
	return prisma.exhibit.findUnique({
		where: { id },
		include: { tags: { include: { tag: true } } },
	})
}

export default async function ExhibitPage({ params }: { params: { id: string } }) {
	const id = Number(params.id)
	if (Number.isNaN(id)) notFound()
	const exhibit = await getExhibit(id)
	if (!exhibit) notFound()

	return (
		<div className="max-w-3xl mx-auto p-6 space-y-6">
			<Link href="/" className="text-sm underline">← Back to gallery</Link>
			<div className="grid gap-6 md:grid-cols-2">
				<div className="relative aspect-square rounded border overflow-hidden">
					<Image src={exhibit.imagePath} alt={exhibit.title} fill className="object-cover" />
				</div>
				<div className="space-y-3">
					<h1 className="text-2xl font-semibold">{exhibit.title}</h1>
					<div className="text-gray-600">{exhibit.year ?? '—'}</div>
					{exhibit.description && <p className="text-sm leading-6 whitespace-pre-wrap">{exhibit.description}</p>}
					<div className="flex flex-wrap gap-1">
						{exhibit.tags.map((t) => (
							<span key={t.tagId} className="text-xs rounded bg-gray-100 border px-1.5 py-0.5">{t.tag.name}</span>
						))}
					</div>
					<form action={async () => {
						'use server'
						await prisma.tagsOnExhibits.deleteMany({ where: { exhibitId: id } })
						await prisma.exhibit.delete({ where: { id } })
						redirect('/')
					}}>
						<button className="rounded border px-4 py-2 text-red-700 border-red-300">Delete</button>
					</form>
				</div>
			</div>
		</div>
	)
}