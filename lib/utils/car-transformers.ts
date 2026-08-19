import type { Car, CarSpecification } from '../api-client';

/**
 * Format a number with Arabic/Egyptian locale
 * Example: 620000 -> "620,000"
 */
export function formatPrice(price: number): string {
  return price.toLocaleString('ar-EG');
}

/**
 * Format mileage with Arabic suffix
 * Example: 45000 -> "45,000 كم"
 */
export function formatMileage(mileage: number): string {
  return `${mileage.toLocaleString('ar-EG')} كم`;
}

/**
 * Map publication status to Arabic display text
 */
export function mapPublicationStatus(status: Car['status']): string {
  const statusMap: Record<Car['status'], string> = {
    DRAFT: 'قيد المراجعة',
    PUBLISHED: 'منشورة',
    SOLD: 'مباعة',
  };
  
  return statusMap[status];
}

/**
 * Interface for CarCard component props
 */
export interface CarCardProps {
  id: string;
  images: string[];
  price: string;
  installment: string;
  title: string;
  trim: string;
  year: string;
  mileage: string;
  location: string;
  status: 'مستعملة' | 'مميز';
  approvalStatus: 'منشورة' | 'مرفوضة' | 'قيد المراجعة' | 'مباعة';
  isGarageCertified?: boolean;
  isFeatured?: boolean;
}

/**
 * Transform Car to CarCard component props format
 */
export function transformCarToCard(car: Car): CarCardProps {
  // If car is featured, show "مميز" status, otherwise show "مستعملة"
  const cardStatus: CarCardProps['status'] =
    car.isFeatured ? 'مميز' : 'مستعملة';

  // Format installment months if available
  const installment = (car as Car & { installmentMonths?: number }).installmentMonths
    ? `تقسيط على ${(car as Car & { installmentMonths?: number }).installmentMonths} شهر`
    : '';

  return {
    id: car.id,
    images: car.images || [],
    price: formatPrice(car.price),
    installment,
    title: `${car.brand} ${car.model}`,
    trim: car.trim || '',
    year: car.year.toString(),
    mileage: formatMileage(car.mileage),
    location: car.address || 'القاهرة، مصر',
    status: cardStatus,
    approvalStatus: mapPublicationStatus(car.status) as CarCardProps['approvalStatus'],
    isGarageCertified: false,
    isFeatured: car.isFeatured,
  };
}

/**
 * Interface for CarsTable row format
 */
export interface CarsTableRow {
  id: string;
  images: string[];
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  address?: string;
  status: Car['status'];
  trim?: string;
  specifications: CarSpecification[];
}

/**
 * Transform Car to CarsTable row format
 */
export function transformCarToTableRow(car: Car): CarsTableRow {
  return {
    id: car.id,
    images: car.images || [],
    brand: car.brand,
    model: car.model,
    year: car.year,
    mileage: car.mileage,
    price: car.price,
    address: car.address,
    status: car.status,
    trim: car.trim,
    specifications: car.specifications || [],
  };
}

/**
 * Interface for car statistics summary
 */
export interface CarStats {
  total: number;
  published: number;
  draft: number;
  sold: number;
}

/**
 * Calculate summary statistics from a list of cars
 */
export function calculateStats(cars: Car[]): CarStats {
  if (!cars || cars.length === 0) {
    return {
      total: 0,
      published: 0,
      draft: 0,
      sold: 0,
    };
  }
  
  return {
    total: cars.length,
    published: cars.filter((car: Car) => car.status === 'PUBLISHED').length,
    draft: cars.filter((car: Car) => car.status === 'DRAFT').length,
    sold: cars.filter((car: Car) => car.status === 'SOLD').length,
  };
}