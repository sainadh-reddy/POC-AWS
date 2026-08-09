import os
import json
import urllib.parse
import boto3
from PIL import Image
import io

s3_client = boto3.client('s3')
THUMBNAIL_BUCKET = os.environ.get('THUMBNAIL_BUCKET')

def handler(event, context):
    """
    AWS Lambda function triggered by S3 ObjectCreated event.
    Reads uploaded attachment image from S3, generates a 128x128 thumbnail,
    and saves it to the target thumbnail bucket under thumbnails/ prefix.
    """
    print("Received event: " + json.dumps(event, indent=2))

    for record in event.get('Records', []):
        bucket_name = record['s3']['bucket']['name']
        object_key = urllib.parse.unquote_plus(record['s3']['object']['key'], encoding='utf-8')
        
        try:
            print(f"Processing object {object_key} from bucket {bucket_name}")
            response = s3_client.get_object(Bucket=bucket_name, Key=object_key)
            image_data = response['Body'].read()

            image = Image.open(io.BytesIO(image_data))
            image.thumbnail((128, 128))

            buffer = io.BytesIO()
            img_format = image.format if image.format else 'JPEG'
            image.save(buffer, format=img_format)
            buffer.seek(0)

            thumb_key = f"thumbnails/thumb-{os.path.basename(object_key)}"
            s3_client.put_object(
                Bucket=THUMBNAIL_BUCKET,
                Key=thumb_key,
                Body=buffer,
                ContentType=response.get('ContentType', 'image/jpeg')
            )
            print(f"Successfully generated thumbnail {thumb_key} in bucket {THUMBNAIL_BUCKET}")

        except Exception as e:
            print(f"Error processing object {object_key}: {str(e)}")
            raise e

    return {
        'statusCode': 200,
        'body': json.dumps('Thumbnail generation completed successfully!')
    }
