import React from "react";
import Image from "next/image";
import Card from "@/components/Card";
import { getCurrentUser } from "@/lib/auth/actions";
import { getAllProducts } from "@/lib/actions/product";

const trending = [
	{
		src: "/trending-1.png",
		alt: "Trending 1",
		href: "/products",
		title: "Editors' pick",
		subtitle: "Curated for style",
	},
	{
		src: "/trending-2.png",
		alt: "Trending 2",
		href: "/products",
		title: "Best seller",
		subtitle: "Most wanted",
	},
	{
		src: "/trending-3.png",
		alt: "Trending 3",
		href: "/products",
		title: "Just landed",
		subtitle: "New this week",
	},
];

const Home = async () => {
	const user = await getCurrentUser();

	const { products } = await getAllProducts({
		page: 1,
		limit: 6,
		search: undefined,
		genderSlugs: [],
		brandSlugs: [],
		categorySlugs: [],
		sizeSlugs: [],
		colorSlugs: [],
		priceMin: undefined,
		priceMax: undefined,
		priceRanges: [],
		sort: "featured",
	});

	return (
		<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			{/* HERO - improved contrast + readable text */}
			<section className="relative mb-8 mt-4 overflow-hidden rounded-lg">
				<div className="absolute inset-0 -z-10">
					<Image
						src="/hero-bg.png"
						alt="Hero background"
						fill
						className="object-cover brightness-75"
						priority
						unoptimized
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
				</div>

				<div className="relative mx-auto max-w-7xl px-6 py-6 sm:py-8">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
						<div className="lg:col-span-7">
							<div className="inline-block rounded-lg bg-black/60 backdrop-blur-sm px-5 py-5 sm:px-8 sm:py-6">
								<h1 className="max-w-2xl text-xl font-extrabold leading-tight text-white sm:text-2xl lg:text-3xl">
									Step into the season — new arrivals that move with you
								</h1>
								<p className="mt-3 max-w-xl text-base text-white/90">
									Fresh drops and timeless classics — handpicked for you. Free shipping on orders over $75.
								</p>

								<div className="mt-6 flex flex-wrap gap-3">
									<a
										href="/products"
										className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow hover:opacity-95"
									>
										Shop trending
									</a>
									<a
										href="/collections"
										className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
									>
										View collections
									</a>
								</div>

								<ul className="mt-4 flex flex-wrap gap-3 text-sm text-white/90">
									<li className="inline-flex items-center gap-2">
										<span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> Free returns
									</li>
									<li className="inline-flex items-center gap-2">
										<span className="inline-block h-2 w-2 rounded-full bg-indigo-400" /> Limited drops
									</li>
									<li className="inline-flex items-center gap-2">
										<span className="inline-block h-2 w-2 rounded-full bg-yellow-300" /> Member rewards
									</li>
								</ul>
							</div>
						</div>

						<div className="lg:col-span-5 hidden lg:block relative">
							<div className="pointer-events-none absolute -right-6 -bottom-6 w-[240px] max-w-[30vw] opacity-90 translate-y-3">
								<Image
									src="/feature.png"
									alt="Featured shoe"
									width={900}
									height={900}
									className="object-contain drop-shadow-2xl"
									priority
									unoptimized
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* TRENDING GALLERY */}
			<section aria-labelledby="trending" className="mb-12">
				<div className="flex items-center justify-between">
					<h2 id="trending" className="text-xl font-semibold text-dark-900">
						Trending now
					</h2>
					<a href="/products" className="text-sm text-gray-600 hover:underline">
						See all
					</a>
				</div>

				<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
					{trending.map((t) => (
						<a
							key={t.src}
							href={t.href}
							className="group relative block overflow-hidden rounded-lg bg-gray-100"
							aria-label={t.alt}
						>
							<div className="relative h-36 sm:h-44">
								<Image
									src={t.src}
									alt={t.alt}
									fill
									sizes="(min-width: 1024px) 33vw, (min-width: 640px) 33vw, 100vw"
									className="object-cover transition-transform duration-300 group-hover:scale-105"
									unoptimized
								/>
							</div>

							<div className="absolute left-4 bottom-4 w-[calc(100%-1rem)] pr-4">
								<div className="backdrop-blur-md rounded-md bg-black/55 px-3 py-2 text-white/95 shadow-sm transition-transform duration-150 group-hover:translate-y-0 group-hover:scale-105">
									<div className="text-sm font-semibold">{t.title}</div>
									<div className="text-xs opacity-80">{t.subtitle}</div>
								</div>
							</div>
						</a>
					))}
				</div>
			</section>

			{/* LATEST PRODUCTS */}
			<section aria-labelledby="latest" className="pb-12">
				<div className="flex items-center justify-between">
					<h2 id="latest" className="text-heading-3 mb-6 text-dark-900">
						Latest shoes
					</h2>
					<a href="/products" className="hidden text-sm text-gray-600 hover:underline sm:inline">
						Browse all
					</a>
				</div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{products.map((p) => {
						const price =
							p.minPrice !== null && p.maxPrice !== null && p.minPrice !== p.maxPrice
								? `$${p.minPrice.toFixed(2)} - $${p.maxPrice.toFixed(2)}`
								: p.minPrice !== null
								? `$${p.minPrice.toFixed(2)}`
								: undefined;
						return (
							<Card
								key={p.id}
								title={p.name}
								subtitle={p.subtitle ?? undefined}
								meta={undefined}
								imageSrc={p.imageUrl ?? "/shoes/shoe-1.jpg"}
								price={price}
								href={`/products/${p.id}`}
							/>
						);
					})}
				</div>
			</section>
		</main>
	);
};

export default Home;