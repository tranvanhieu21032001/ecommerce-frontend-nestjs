import Image from "next/image";
import Link from "next/link";

import { Title } from "@/components/home/title";
import { blogs } from "@/lib/mock/home";

export function LatestBlog() {
  return (
    <div id="blog" className="mb-10 lg:mb-20">
      <Title>Latest Blog</Title>
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {blogs.map((blog) => (
          <article key={blog.id} className="overflow-hidden rounded-lg">
            <Link href="#blog">
              <Image
                src={blog.image}
                alt={blog.title}
                width={500}
                height={500}
                className="max-h-80 w-full object-cover"
              />
            </Link>
            <div className="bg-[#F6F6F6] p-5">
              <div className="flex items-center gap-5 text-xs">
                <p className="font-semibold tracking-wider text-[#063C28]">
                  {blog.category}
                </p>
                <p className="text-[#52525B]">{blog.date}</p>
              </div>
              <Link
                href="#blog"
                className="mt-5 line-clamp-2 block text-base font-semibold tracking-wide transition-colors duration-300 hover:text-[#063C28]"
              >
                {blog.title}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
