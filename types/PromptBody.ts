export interface ImagePromptBody {
    prompt?: string,
    image: string
}

export interface PromptBody {
    prompt: string
}

export interface GenerateQuery {
    dontusecache?: string
}