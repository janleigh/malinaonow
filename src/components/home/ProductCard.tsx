import { Product } from "@/lib/types/product";
import { shadowStyles } from "@/lib/utils/styles";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Animated, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

export const ProductCard = ({
  product,
  listView = false,
  isBookmarked = false,
  onToggleBookmark,
  onAddToCart
}: {
  product: Product;
  listView?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: (productId: string, newStatus: boolean) => void;
  onAddToCart?: (productId: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    if (!expanded) {
      setExpanded(true);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]).start(() => {
        setExpanded(false);
      });
    }
  };

  const handleToggleBookmark = (e: any) => {
    e.stopPropagation && e.stopPropagation();
    const newStatus = !bookmarked;
    setBookmarked(newStatus);
    if (onToggleBookmark) onToggleBookmark(product.id, newStatus);
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation && e.stopPropagation();
    if (onAddToCart) onAddToCart(product.id);
  };

  return (
    <>
      <TouchableOpacity
        key={product.id}
        className={`bg-white border border-[#333333] my-2 overflow-hidden ${listView ? "" : ""}`}
        style={shadowStyles.standard}
        onPress={toggleExpand}
      >
        {listView ? (
          <View className="flex-row">
            <View className="w-1/3 h-24">
              {product.image_url ? (
                <Image source={{ uri: product.image_url }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="w-full h-full bg-gray-100 items-center justify-center">
                  <Feather name="package" size={40} color="#999" />
                </View>
              )}
            </View>
            <View className="p-3 flex-1">
              <Text className="text-sm font-lexend-extrabold tracking-tighter-lexend text-black" numberOfLines={1}>{product.name}</Text>
              <Text className="text-xs font-lexend tracking-tighter-lexend text-[#666666] mt-1" numberOfLines={2}>{product.description}</Text>
              <View className="flex-row items-center mt-1">
                <View className={`px-2 py-1 rounded ${product.is_available ? "bg-green-100" : "bg-red-100"} ml-2`}>
                  <Text className={`text-xs font-lexend-medium ${product.is_available ? "text-green-800" : "text-red-800"}`}>{product.is_available ? "Available" : "Unavailable"}</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View>
            <View className="w-full h-32">
              {product.image_url ? (
                <Image source={{ uri: product.image_url }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="w-full h-full bg-gray-100 items-center justify-center">
                  <Feather name="package" size={40} color="#999" />
                </View>
              )}
            </View>
            <View className="p-3">
              <Text className="text-sm font-lexend-extrabold tracking-tighter-lexend text-black" numberOfLines={2}>{product.name}</Text>
              <Text className="text-xs font-lexend tracking-tighter-lexend text-[#666666] mt-1" numberOfLines={2}>{product.description}</Text>
              <View className="flex-row items-center mt-1">
                <View className={`px-2 py-1 rounded ${product.is_available ? "bg-green-100" : "bg-red-100"} ml-2`}>
                  <Text className={`text-xs font-lexend-medium ${product.is_available ? "text-green-800" : "text-red-800"}`}>{product.is_available ? "Available" : "Unavailable"}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
      <Modal visible={expanded} transparent={true} animationType="none">
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: "#faf4f0",
            opacity: opacityAnim,
            transform: [
              {
                scale: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] })
              }
            ]
          }}
        >
          <View className="flex-1">
            <View className="flex-row justify-between items-center p-4 border-b border-[#333333]">
              <Text className="text-xl font-lexend-bold tracking-tighter-lexend text-black">{product.name}</Text>
              <TouchableOpacity onPress={toggleExpand}>
                <Feather name="x" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <ScrollView className="flex-1">
              {product.image_url ? (
                <Image source={{ uri: product.image_url }} className="w-full h-52" resizeMode="cover" />
              ) : (
                <View className="w-full h-52 bg-gray-100 items-center justify-center">
                  <Feather name="package" size={40} color="#999" />
                </View>
              )}
              <View className="p-4">
                <View className="flex-row space-x-2 mt-4">
                  <TouchableOpacity
                    className="flex-1 bg-[#fed787] h-12 items-center justify-center border border-[#333333] rounded-full"
                    style={shadowStyles.standard}
                    onPress={handleToggleBookmark}
                  >
                    <AntDesign name={bookmarked ? "heart" : "hearto"} size={20} color={bookmarked ? "#FE5B62" : "#333"} />
                    <Text className="text-base font-lexend-medium tracking-tighter-lexend text-black">Bookmark</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-white h-12 items-center justify-center border border-[#333333] rounded-full"
                    style={shadowStyles.standard}
                    onPress={handleAddToCart}
                  >
                    <Feather name="shopping-cart" size={20} color="#333" />
                    <Text className="text-base font-lexend-medium tracking-tighter-lexend text-black">Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

export default ProductCard;