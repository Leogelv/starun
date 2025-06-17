"use client"
import {useLessons} from "@/fsd/entities/lessons/hooks/useLessons";

export const LessonsPage = () => {
    const {data, isLoading} = useLessons()
    return(
        <div>
            {data?.map(el => (
                <div key={el.id}>
                    {el.title}
                </div>
            ))}
        </div>
    )
}