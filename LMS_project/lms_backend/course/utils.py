def get_slug(title: str) -> str:
    # Convert to lowercase
    slug = title.lower()
    
    # Replace spaces and underscores with hyphens
    slug = slug.replace(' ', '-').replace('_', '-')
    
    # Remove any characters that are not alphanumeric or hyphens
    slug = ''.join(c for c in slug if c.isalnum() or c == '-')
    
    return slug