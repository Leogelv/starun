import {useQuery} from "@tanstack/react-query";
import {Lesson} from "@/fsd/entities/lessons/types";
import {fetchLessons} from "@/fsd/shared/api/lessons";

export const useLessons = () => {
    return useQuery<Lesson[]>({
        queryKey: ["lessons"],
        queryFn: () => fetchLessons()
    });
};