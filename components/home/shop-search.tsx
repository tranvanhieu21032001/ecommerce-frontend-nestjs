"use client";

import { Loader2, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { getProducts, type Product } from "@/lib/api/products";

export function ShopSearch() {
  const router = useRouter();
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const term = query.trim();
  const showResults = isFocused && term.length > 0;

  useEffect(() => {
    if (!term) {
      return;
    }

    let active = true;
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await getProducts({
          search: term,
          isActive: true,
          page: 1,
          limit: 5,
        });

        if (active) {
          setResults(response.data);
        }
      } catch {
        if (active) {
          setResults([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [term]);

  useEffect(() => {
    function closeSearch(event: MouseEvent) {
      const target = event.target as Node;
      const insideDesktop = desktopContainerRef.current?.contains(target);
      const insideMobile = mobileContainerRef.current?.contains(target);

      if (!insideDesktop && !insideMobile) {
        setIsFocused(false);
        setIsMobileOpen(false);
      }
    }

    window.addEventListener("mousedown", closeSearch);
    return () => window.removeEventListener("mousedown", closeSearch);
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!term) {
      return;
    }

    setIsFocused(false);
    setIsMobileOpen(false);
    router.push(`/shop?search=${encodeURIComponent(term)}`);
  }

  return (
    <>
      <div ref={desktopContainerRef} className="relative hidden md:block">
        <SearchForm
          query={query}
          onChange={setQuery}
          onFocus={() => setIsFocused(true)}
          onSubmit={submitSearch}
        />
        {showResults ? (
          <SearchResults
            query={term}
            products={results}
            isLoading={isLoading}
            onNavigate={() => setIsFocused(false)}
          />
        ) : null}
      </div>

      <button
        type="button"
        aria-label="Search products"
        onClick={() => {
          setIsMobileOpen((open) => !open);
          setIsFocused(true);
        }}
        className="transition-colors duration-300 hover:text-[#3B9C3C] md:hidden"
      >
        <Search size={20} />
      </button>

      {isMobileOpen ? (
        <div
          ref={mobileContainerRef}
          className="absolute left-0 top-full w-full border-t border-[#E5E7EB] bg-white px-5 py-4 shadow-lg md:hidden"
        >
          <div className="flex items-center gap-3">
            <SearchForm
              query={query}
              onChange={setQuery}
              onFocus={() => setIsFocused(true)}
              onSubmit={submitSearch}
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setIsMobileOpen(false)}
              className="text-[#52525B]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {showResults ? (
            <SearchResults
              query={term}
              products={results}
              isLoading={isLoading}
              mobile
              onNavigate={() => {
                setIsFocused(false);
                setIsMobileOpen(false);
              }}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function SearchForm({
  query,
  onChange,
  onFocus,
  onSubmit,
}: {
  query: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex h-11 w-full items-center rounded-full bg-[#F6F6F6] px-4 text-[#52525B] md:w-[230px] xl:w-[285px]"
    >
      <input
        type="search"
        value={query}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        placeholder="Search products"
        aria-label="Search products"
        className="min-w-0 flex-1 bg-transparent text-sm text-[#151515] outline-none placeholder:text-[#71717A]"
      />
      <button
        type="submit"
        aria-label="Submit search"
        className="ml-2 transition-colors hover:text-[#3B9C3C]"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}

function SearchResults({
  query,
  products,
  isLoading,
  mobile = false,
  onNavigate,
}: {
  query: string;
  products: Product[];
  isLoading: boolean;
  mobile?: boolean;
  onNavigate: () => void;
}) {
  return (
    <div
      className={
        mobile
          ? "mt-3 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white"
          : "absolute right-0 top-[calc(100%+12px)] w-[360px] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.14)]"
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-[#52525B]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching...
        </div>
      ) : products.length ? (
        <div>
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/shop/product/${product.id}`}
              onClick={onNavigate}
              className="flex items-center gap-3 border-b border-[#E5E7EB] px-4 py-3 transition-colors last:border-b-0 hover:bg-[#F6F6F6]"
            >
              <Image
                src={getProductImage(product)}
                alt={product.name}
                width={48}
                height={48}
                unoptimized
                className="h-12 w-12 rounded-md bg-[#F6F6F6] object-contain"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#151515]">
                  {product.name}
                </p>
                <p className="mt-0.5 text-xs font-medium text-[#3B9C3C]">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="px-4 py-7 text-center text-sm text-[#52525B]">
          No products found for &quot;{query}&quot;
        </p>
      )}
      <Link
        href={`/shop?search=${encodeURIComponent(query)}`}
        onClick={onNavigate}
        className="block border-t border-[#E5E7EB] px-4 py-3 text-center text-sm font-semibold text-[#063C28] transition-colors hover:bg-[#F0FDF4] hover:text-[#3B9C3C]"
      >
        View all results
      </Link>
    </div>
  );
}

function getProductImage(product: Product) {
  return (
    product.images?.find((image) => image.isPrimary)?.imageUrl ??
    product.imageUrl ??
    "/icons/product-list.svg"
  );
}
