import { supabase } from "@/api/supabase";
import { RatingStars } from "@/components/home/reviews";
import { Review } from "@/lib/types/supabase";
import { formatDate } from "@/lib/utils/date";
import { shadowStyles } from "@/lib/utils/styles";
import { LocationService, ReviewService } from "@/services";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ReviewWithLocation extends Review {
  locationName?: string;
}

export default function ModerateReviewsScreen() {
  const [reviews, setReviews] = useState<ReviewWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState(0);
  const [showFlagged, setShowFlagged] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all locations first
      const locations = await LocationService.getLocations();
      const locationMap = locations.reduce((acc, loc) => ({
        ...acc,
        [loc.id]: loc.name
      }), {} as Record<string, string>);

      // Fetch reviews for all locations
      const allReviews: ReviewWithLocation[] = [];
      for (const location of locations) {
        const locationReviews = await ReviewService.getReviews(location.id);
        const reviewsWithLocation = locationReviews.map(review => ({
          ...review,
          locationName: locationMap[review.location_id] || 'Unknown Location'
        }));
        allReviews.push(...reviewsWithLocation);
      }

      setReviews(allReviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.locationName?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesRating = filterRating === 0 || review.rating === filterRating;
    const matchesFlagged = !showFlagged || review.flagged;
    
    return matchesSearch && matchesRating && matchesFlagged;
  });

  const handleFlagReview = async (reviewId: string) => {
    try {
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      const { error } = await supabase
        .from("reviews")
        .update({ flagged: !review.flagged })
        .eq("id", reviewId);

      if (error) throw error;

      // Update local state
      setReviews(reviews.map(r => 
        r.id === reviewId ? { ...r, flagged: !r.flagged } : r
      ));

    } catch (err) {
      console.error("Error toggling flag:", err);
      Alert.alert("Error", "Failed to update review status");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("reviews")
                .delete()
                .eq("id", reviewId);

              if (error) throw error;

              // Refresh reviews after deletion
              await fetchReviews();
            } catch (err) {
              console.error("Error deleting review:", err);
              Alert.alert("Error", "Failed to delete review");
            }
          },
        },
      ]
    );
  };

  const renderReviewItem = ({ item }: { item: ReviewWithLocation }) => (
    <View className="mb-4 p-4 bg-white rounded-lg" style={shadowStyles.standard}>
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-bold">{item.user_name || 'Anonymous'}</Text>
        <View className="flex-row items-center">
          <RatingStars rating={item.rating} />
          <Text className="ml-2 text-yellow-500 font-bold">{item.rating}/5</Text>
        </View>
      </View>
      
      {item.comment ? (
        <Text className="text-gray-700 mb-2">{item.comment}</Text>
      ) : (
        <Text className="text-gray-400 italic mb-2">No comment</Text>
      )}
      
      <View className="flex-row justify-between items-center">
        <Text className="text-sm text-gray-500">
          {item.locationName || 'Unknown Location'}
        </Text>
        <Text className="text-xs text-gray-400">
          {formatDate(item.created_at)}
        </Text>
      </View>
      
      <View className="flex-row mt-3 space-x-2">
        <TouchableOpacity
          className={`flex-1 py-2 rounded items-center ${item.flagged ? 'bg-red-100' : 'bg-gray-100'}`}
          onPress={() => handleFlagReview(item.id)}
        >
          <Text className={item.flagged ? 'text-red-600 font-medium' : 'text-gray-600'}>
            {item.flagged ? 'Flagged' : 'Flag'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="flex-1 py-2 bg-red-50 rounded items-center"
          onPress={() => handleDeleteReview(item.id)}
        >
          <Text className="text-red-600 font-medium">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600">Loading reviews...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 mb-4 text-center">{error}</Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-2 rounded"
          onPress={fetchReviews}
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="p-4 bg-white border-b border-gray-200">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold">Moderate Reviews</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="x" size={24} color="black" />
            </TouchableOpacity>
          </View>
          
          {/* Search */}
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-3">
            <Feather name="search" size={18} color="#666" />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder="Search reviews..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          
          {/* Filters */}
          <View className="flex-row justify-between items-center">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  className={`px-3 py-1 rounded-full ${filterRating === 0 ? 'bg-blue-500' : 'bg-gray-200'}`}
                  onPress={() => setFilterRating(0)}
                >
                  <Text className={filterRating === 0 ? 'text-white' : 'text-gray-700'}>All</Text>
                </TouchableOpacity>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    className={`px-3 py-1 rounded-full ${filterRating === rating ? 'bg-blue-500' : 'bg-gray-200'}`}
                    onPress={() => setFilterRating(rating)}
                  >
                    <Text className={filterRating === rating ? 'text-white' : 'text-gray-700'}>{rating}★</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <TouchableOpacity
              className={`px-3 py-1 rounded-full ${showFlagged ? 'bg-red-100' : 'bg-gray-200'}`}
              onPress={() => setShowFlagged(!showFlagged)}
            >
              <Text className={showFlagged ? 'text-red-600' : 'text-gray-700'}>Flagged</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Reviews List */}
        <View className="flex-1 p-4">
          {filteredReviews.length > 0 ? (
            <FlatList
              data={filteredReviews}
              renderItem={renderReviewItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500 text-lg">
                {reviews.length === 0 ? 'No reviews found' : 'No matching reviews'}
              </Text>
              {reviews.length > 0 && (
                <Text className="text-gray-400 mt-2 text-center">
                  Try adjusting your search or filter criteria
                </Text>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
