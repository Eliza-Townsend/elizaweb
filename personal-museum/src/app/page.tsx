import Link from 'next/link'
import Image from 'next/image'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getData(search: string | null, tag: string | null) {
	const where: any = {}
	if (search) {
		where.OR = [
			{ title: { contains: search, mode: 'insensitive' } },
			{ description: { contains: search, mode: 'insensitive' } },
		]
	}
	if (tag) {
		where.tags = { some: { tag: { name: tag } } }
	}
	const [exhibits, tags] = await Promise.all([
		prisma.exhibit.findMany({
			where,
			include: { tags: { include: { tag: true } } },
			orderBy: { createdAt: 'desc' },
		}),
		prisma.tag.findMany({ orderBy: { name: 'asc' } }),
	])
	return { exhibits, tags }
}

export default async function Home({ searchParams }: { searchParams: { q?: string; tag?: string } }) {
	const q = searchParams?.q ?? null
	const tag = searchParams?.tag ?? null
	const { exhibits, tags } = await getData(q, tag)

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-semibold">Personal Museum</h1>
				<Link href="/exhibits/new" className="rounded bg-black text-white px-4 py-2">Add Exhibit</Link>
			</div>
			<form className="flex flex-wrap gap-3">
				<input
					name="q"
					defaultValue={q ?? ''}
					placeholder="Search title or description"
					className="rounded border p-2 flex-1 min-w-[240px]"
				/>
				<select name="tag" defaultValue={tag ?? ''} className="rounded border p-2">
					<option value="">All tags</option>
					{tags.map((t) => (
						<option key={t.id} value={t.name}>{t.name}</option>
					))}
				</select>
				<button type="submit" className="rounded border px-4 py-2">Filter</button>
			</form>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{exhibits.map((ex) => (
					<Link key={ex.id} href={`/exhibits/${ex.id}`} className="group block">
						<div className="aspect-square relative overflow-hidden rounded border">
							<Image src={ex.imagePath} alt={ex.title} fill className="object-cover group-hover:scale-105 transition-transform" />
						</div>
						<div className="mt-2">
							<div className="font-medium">{ex.title}</div>
							<div className="text-sm text-gray-500">
								{ex.year ?? '—'}
							</div>
							<div className="mt-1 flex flex-wrap gap-1">
								{ex.tags.map((t) => (
									<span key={t.tagId} className="text-xs rounded bg-gray-100 border px-1.5 py-0.5">{t.tag.name}</span>
								))}
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	)
}
