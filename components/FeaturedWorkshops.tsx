"use client";

import { workshops as staticWorkshops, type Workshop } from "@/lib/data";
import CourseCard from "@/components/CourseCard";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Featured Workshops Component
 * Loads featured workshops from database and displays them
 */
export default function FeaturedWorkshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadFeaturedWorkshops();
  }, []);

  /**
   * Loads featured workshops from database and merges with static data
   */
  const loadFeaturedWorkshops = async () => {
    try {
      setLoading(true);
      const { data: courses, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .order("title");

      if (error) {
        console.error("Error loading courses:", error);
        // Fallback to static featured workshops if database fails
        const featured = staticWorkshops.filter((w) => w.featured);
        setWorkshops(featured);
        return;
      }

      // Merge database courses with static workshop data
      const mergedWorkshops: Workshop[] = (courses || []).map((course) => {
        // Find matching static workshop by ID
        const staticWorkshop = staticWorkshops.find((w) => w.id === course.id);
        
        // Use database data for title, description, duration, price, day
        // Use static data for images, badgeText, featured, etc.
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          duration: course.duration,
          price: course.price,
          day: course.day || staticWorkshop?.day,
          images: staticWorkshop?.images,
          badgeText: staticWorkshop?.badgeText,
          featured: staticWorkshop?.featured,
          topOffer: staticWorkshop?.topOffer,
        };
      });

      // Filter for featured workshops only
      const featuredWorkshops = mergedWorkshops.filter((w) => w.featured);
      
      // If no featured workshops from database, fallback to static featured workshops
      if (featuredWorkshops.length === 0) {
        const staticFeatured = staticWorkshops.filter((w) => w.featured);
        setWorkshops(staticFeatured);
      } else {
        setWorkshops(featuredWorkshops);
      }
    } catch (err) {
      console.error("Error loading courses:", err);
      // Fallback to static featured workshops on error
      const featured = staticWorkshops.filter((w) => w.featured);
      setWorkshops(featured);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {workshops.map((workshop) => (
        <CourseCard key={workshop.id} workshop={workshop} />
      ))}
    </>
  );
}



