import { useQuery } from "@tanstack/react-query";

export interface HomeSlide {
    id: number;
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    background_url: string;
    cta_text: string;
    cta_link: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
    display_order: number;
}

export function useHomeSlides() {
    return useQuery({
        queryKey: ['home-slides'],
        queryFn: async (): Promise<HomeSlide[]> => {
            const res = await fetch('/api/home-slides');
            if (!res.ok) throw new Error('Failed to fetch home slides');
            return res.json();
        }
    });
}

export interface HomeHero {
    title: string;
    subtitle: string;
    description: string;
    cta_text: string;
    cta_link: string;
    background_url?: string;
}

export function useHomeHero() {
    return useQuery({
        queryKey: ['home-hero'],
        queryFn: async (): Promise<HomeHero> => {
            const res = await fetch('/api/home-hero');
            if (!res.ok) throw new Error('Failed to fetch home hero');
            return res.json();
        }
    });
}

export interface HomeStat {
    id: number;
    label: string;
    value: string;
    icon_name: string;
    description: string;
    is_warning: boolean;
    display_order: number;
}

export function useHomeStats() {
    return useQuery({
        queryKey: ['home-stats'],
        queryFn: async (): Promise<HomeStat[]> => {
            const res = await fetch('/api/home-stats');
            if (!res.ok) throw new Error('Failed to fetch home stats');
            return res.json();
        }
    });
}

export interface HomeService {
    id: number;
    title: string;
    description: string;
    icon_name: string;
    link: string;
    features: string[];
    display_order: number;
}

export function useHomeServices() {
    return useQuery({
        queryKey: ['home-services'],
        queryFn: async (): Promise<HomeService[]> => {
            const res = await fetch('/api/home-services');
            if (!res.ok) throw new Error('Failed to fetch home services');
            return res.json();
        }
    });
}

export interface Testimonial {
    id: number;
    name: string;
    role: string;
    content: string;
    rating: number;
    avatar_url?: string;
}

export function useTestimonials() {
    return useQuery({
        queryKey: ['testimonials'],
        queryFn: async (): Promise<Testimonial[]> => {
            const res = await fetch('/api/testimonials');
            if (!res.ok) throw new Error('Failed to fetch testimonials');
            return res.json();
        }
    });
}

export interface Partner {
    id: number;
    name: string;
    logo_url: string;
    category: string;
    display_order: number;
}

export function usePartners() {
    return useQuery({
        queryKey: ['partners'],
        queryFn: async (): Promise<Partner[]> => {
            const res = await fetch('/api/partners');
            if (!res.ok) throw new Error('Failed to fetch partners');
            return res.json();
        }
    });
}
