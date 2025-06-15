
import { useQuery } from '@tanstack/react-query';
import { getWaterQualityByCommune, calculateQualityScore, getQualityGrade } from '@/services/dataGouvApi';

export const useWaterQuality = (commune: string) => {
  return useQuery({
    queryKey: ['waterQuality', commune],
    queryFn: () => getWaterQualityByCommune(commune),
    enabled: !!commune && commune.length > 2,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 heure
    select: (data) => {
      const score = calculateQualityScore(data.data);
      const grade = getQualityGrade(score);
      
      return {
        ...data,
        score,
        grade,
        lastAnalysis: data.data.length > 0 ? data.data[0].datePrelevement : null
      };
    }
  });
};
