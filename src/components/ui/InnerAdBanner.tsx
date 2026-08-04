"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Sparkles, Megaphone, ArrowLeft, ShieldCheck, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface InnerAdBannerProps {
  badge?: string;
  title: string;
  subtitle: string;
  highlightText?: string;
  ctaText?: string;
  ctaLink?: string;
  image?: string;
  sponsorName?: string;
  variant?: "navy" | "gold" | "compact";
  className?: string;
}

export function InnerAdBanner({
  badge = "إعلان مميز",
  title,
  subtitle,
  highlightText,
  ctaText = "استفد من العرض",
  ctaLink = "/categories/building-materials",
  image,
  sponsorName = "شريك معتمد",
  variant = "navy",
  className,
}: InnerAdBannerProps) {
  if (variant === "compact") {
    return (
      <div className={cn("container mx-auto px-4 my-8", className)} dir="rtl">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F1D3A] via-[#0A1128] to-[#16274B] border-2 border-[#F59E0B]/40 p-4 sm:p-6 shadow-brutal flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-[#0A1128] flex items-center justify-center font-black flex-shrink-0 shadow-md">
              <Megaphone size={20} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-[#F59E0B] text-[#0A1128] px-2 py-0.5 rounded">
                  {badge}
                </span>
                <span className="text-xs text-[#FACC15] font-bold">بواسطة {sponsorName}</span>
              </div>
              <h4 className="font-bold text-white text-base sm:text-lg">{title}</h4>
            </div>
          </div>
          <Link href={ctaLink} className="w-full sm:w-auto">
            <Button variant="brutal" size="sm" className="w-full sm:w-auto gap-2 text-xs px-5 py-2">
              {ctaText} <ArrowLeft size={14} />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "gold") {
    return (
      <div className={cn("container mx-auto px-4 my-12", className)} dir="rtl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#F59E0B] via-[#FACC15] to-[#EAB308] text-[#0A1128] border-4 border-[#0A1128] p-8 lg:p-12 shadow-brutal grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#0A1128] text-[#FACC15] text-xs font-black px-3 py-1.5 rounded-full shadow">
              <Sparkles size={14} />
              <span>{badge}</span>
              <span className="opacity-40">•</span>
              <span className="text-white font-bold">{sponsorName}</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-black leading-tight text-[#0A1128]">
              {title}
            </h3>
            <p className="text-[#0A1128]/90 font-medium text-lg leading-relaxed max-w-2xl">
              {subtitle}
            </p>
            {highlightText && (
              <div className="inline-flex items-center gap-2 bg-[#0A1128]/10 border border-[#0A1128]/20 px-4 py-2 rounded-xl text-[#0A1128] font-black text-sm">
                <Tag size={16} /> {highlightText}
              </div>
            )}
            <div className="pt-2">
              <Link href={ctaLink}>
                <Button className="bg-[#0A1128] text-[#FACC15] hover:bg-[#0F1D3A] border-2 border-[#0A1128] font-black text-lg px-8 py-4 shadow-brutal">
                  {ctaText}
                </Button>
              </Link>
            </div>
          </div>
          {image && (
            <div className="lg:col-span-4 relative">
              <div className="aspect-[4/3] rounded-2xl border-3 border-[#0A1128] overflow-hidden shadow-brutal relative group">
                <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-[#0A1128] text-[#FACC15] text-[10px] font-black px-2 py-1 rounded">
                  راعي رسمي
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard Navy/Adaptive Banner
  return (
    <div className={cn("container mx-auto px-4 my-12", className)} dir="rtl">
      <div className="relative overflow-hidden rounded-3xl bg-card border-3 border-primary p-8 lg:p-12 shadow-brutal grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="absolute top-0 left-0 w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="lg:col-span-7 space-y-5 z-10">
          <div className="inline-flex items-center gap-2 bg-secondary border border-primary/40 text-primary text-xs font-black px-3.5 py-1.5 rounded-full shadow-sm">
            <ShieldCheck size={14} className="text-primary" />
            <span>{badge}</span>
            <span className="opacity-50">•</span>
            <span className="text-foreground">{sponsorName}</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black leading-tight text-foreground">
            {title}
          </h3>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            {subtitle}
          </p>
          {highlightText && (
            <div className="inline-block bg-primary/10 border border-primary/30 text-primary font-extrabold px-4 py-2 rounded-xl text-sm shadow-inner">
              {highlightText}
            </div>
          )}
          <div className="pt-2 flex flex-wrap gap-4">
            <Link href={ctaLink}>
              <Button variant="brutal" size="lg" className="px-8 gap-2">
                {ctaText} <ArrowLeft size={18} />
              </Button>
            </Link>
          </div>
        </div>
        {image && (
          <div className="lg:col-span-5 relative z-10">
            <div className="aspect-[16/10] rounded-2xl border-3 border-primary overflow-hidden shadow-brutal group">
              <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
