import re
from ollama import chat
from ollama import ChatResponse

class CommentClassifier:
    def __init__(self, model_name='llama3.2'):
        """
        Initialize the CommentClassifier with the model name.
        """
        self.model_name = model_name
        # Define regex pattern to detect sentiment keywords
        self.valid_classifications = r'(positive|negative|neutral|confused)'

        # Define additional patterns for contextual classification
        self.contextual_classifications = {
            'hate': 'negative',
            'discriminatory': 'negative',
            'violent': 'negative',
            'dehumanizing': 'negative',
            'derogatory': 'negative',
            'offensive': 'negative',
            'harmful': 'negative',
            'stereotypes': 'negative',
            'violence':'negative',
            'assault':'negative',
            'punishment':'negative'
        }

    def classify_with_model(self, comment_text, article_title):
        """
        Classify a single comment using the specified model. Ensure the result includes a valid sentiment.
        """
        try:
            # Generate prompt
            prompt = (
                # in the context of the article title and
                f"Analyze the sentiment of the following Darija (Moroccan Arabic) / Arabic  comment  using the words used in the comment carefully. "
                f"Classify the sentiment as one of the following : Positive, Negative, Neutral."
                f"Dont use any other word dont use any other word."
                f"(if you are not sure) return Error. Respond with only ONE WORD"
                f"Comment: {comment_text}."
            )

            print(prompt)
            # prompt =(
            #     f"Analyze the sentiment of the following comment, "
            #     "written in Darija (Moroccan Arabic) or Modern Standard Arabic, within the context of the provided article title. "
            #     "Consider the tone, intent, and language used in the comment to classify its sentiment as one of the following: Positive, Negative, or Neutral."
            #     "If the comment contains unclear or contradictory sentiments or you are unsure what the person is meaning , respond with 'Error' Use ONLY ONE WORD from the allowed categories (Positive, Negative, Neutral)."
            #     "Avoid any explanations, additional words, or elaboration."
            #     f"Comment: {comment_text}"
            # )

            # Send prompt to model
            response: ChatResponse = chat(model=self.model_name, messages=[
                {
                    'role': 'user',
                    'content': prompt,
                },
            ])
            model_output = response.message.content.strip().lower()

            # First check for explicit sentiment keywords
            match = re.search(self.valid_classifications, model_output, re.IGNORECASE)
            if match:
                return match.group(1).lower()  # Normalize to lowercase for consistency

            # If no direct match, check for contextual phrases
            for keyword, classification in self.contextual_classifications.items():
                if keyword in model_output:
                    return classification

            # If no matches found, default to 'confused'
            print(f"No valid classification found in model output: {model_output}. Returning 'confused'.\n{comment_text}")
            return "confused"
        except Exception as e:
            print(f"Error classifying comment with model: {e}")
            return "confused"

    def classify_comment(self, comment_text, article_title):
        """
        Classify a comment using the model and contextual patterns. Return the classification.
        """
        model_result = self.classify_with_model(comment_text, article_title)

        # Check if the model returned a valid classification
        if model_result in ["positive", "negative", "neutral", "confused"]:
            return model_result

        # If neither the model nor contextual patterns can classify, return 'confused'
        return "confused"

    def process_article_comments(self, article):
        """
        Process an article's comments and classify each one. Return the full article with classified comments.
        """
        article_title = article.get('title', 'title is unknown for this article')
        comments = article.get('comments', [])

        for comment in comments:
            comment_text = comment.get('text', '')
            if comment_text:
                classification = self.classify_comment(comment_text, article_title)
                # Add classification to the original comment object
                comment['label'] = classification

        # Return the updated article with classified comments
        return article



if __name__ =='__main__':

    # Example usage
    classifier = CommentClassifier()

    # Example article object
    article =  {
    "href": "https://www.hespress.com/%d9%81%d8%b1%d9%86%d8%b3%d8%a7-%d8%aa%d8%b4%d9%8a%d8%af-%d8%a8%d8%a7%d9%84%d8%aa%d8%b9%d8%a7%d9%88%d9%86-%d8%a7%d9%84%d8%a3%d9%85%d9%86%d9%8a-%d9%85%d8%b9-%d8%a7%d9%84%d9%85%d8%ba%d8%b1%d8%a8-1352529.html",
    "img_url": "https://i1.hespress.com/wp-content/uploads/2024/04/Gerald-Darmanin.jpg",
    "title": "فرنسا تشيد بالتعاون الأمني مع المغرب",
    "date": "الإثنين 22 أبريل 2024 - 21:21",
    "category": "politique-سياسة",
    "comments": [
      {
        "id": "comment-18881988",
        "author": "عمر",
        "date": "الإثنين 22 أبريل 2024 - 21:27",
        "text": "فرنسا ستنظم اكبر عرس كروي في العالم وهو الاولمبياد وهي في حاجة ماسة لخدمات رجل الامن المغربي العبقري الحموشي….لذلك نرى هذا التقرب الغريب … فرنسا عليها ان تحدو حدو رئيس الوزراء الاسباني السيد المحترم سانشيز واول خطوة هي الاعتراف بالامر الواقع الذي فرضه المغاربة في الصحراء المغربية….اعترفي او لا تعترفي يا فرنسا فالصحراء مغربية رغم انوفكم جميعا…",
        "likes": "5",
      },
      {
        "id": "comment-18882024",
        "author": "عبد الله",
        "date": "الإثنين 22 أبريل 2024 - 21:46",
        "text": "وزير الداخلية الفرنسي جاء الى المغرب من اجل مصالح فرنسا و منها  الهجرة الغير شرعية و مشكل الأئمة المغاربة و التعاون الأمني . اقول ل دارمانان ان المغرب له سيادة و ليس ضيعة لأحد و اعلم ان الصحراء مغربية شئتم أم أبيتم و اتمنى ان نتخلص قريبا من اللغة الفرنسية و نعوضها بالإنجليزية لغة العلم و التكنولوجيا",
        "likes": "8",
      },
      {
        "id": "comment-18882163",
        "author": "بن عاشر",
        "date": "الإثنين 22 أبريل 2024 - 23:02",
        "text": "لاثقة في عتيقة لي هي فرنسا.. بصراحة كمغربي  لا اريد ان يقوم رجال الأمن بحراسة  العرس الرياضي الفرنسي لللانني لدي حدس بتشوفيه سمعة رجال امننا المغاربة.. و توريطهم في فضائح و فرنسا عمرها  بغات الخير لبلادنا… و التاريخ يشهد بذالك… على المغرب ان يعتذر لفرنسا عن عدم مساعدته فرنسا او يلغيه نهائيآ و ينأى عن مشاكل فرنسا يدبرو  راسهم.. و حنا اش. مالنا.. ماشي الشرطي المغربي لي غيطوه الفرنسيين الزراوط.. و يعطيه أوامر بضرب المغاربيين و الأفارقة… و في الأخير يقول للصحافة الدولية.. هذا شرطة مغاربة.. ماشي حنا الفرنسيين.. و يخلقو لينا فالاخر مشاكل  مع تلك الدول… و السمعة ديال البلاد تطيح الأرض… لا.. لا.. التعاون  امتيا نعم مع جميع الدول الا فرنسا.. أرفض ذالك تماما.. جملة و تفصيلا…",
        "likes": "2",
      },
      {
        "id": "comment-18882201",
        "author": "مغربي",
        "date": "الإثنين 22 أبريل 2024 - 23:31",
        "text": "المغرب المغاربة اليوم أقوى من اي وقت مضى بالجميع المقاييس بشتى المجالات على رأسها المجال الامني بالقيادة ملكنا المفدى أعزه الله و نصره و أدام عليه الصحة و السلامة و الأفراح و المسرات و التوفيق و التفوق باستمرار أينما حل و ارتحل الراءد بالجميع المقاييس في خدمة المغرب المغاربة بشتى المجالات بوضوح و طموح لا محدود دون ملل او كلل و نكران الذات و من خلفه الكفاءات المغربية الكفوءة التي تجعل المصالح العليا للمغرب و المغاربة فوق كل اعتبار باستمرار أينما تواجدو بأرجاء العالم.",
        "likes": "-2",
      },
       {
        "id": "comment-18882201",
        "author": "jeh",
        "date": "الإثنين 22 أبريل 2024 - 23:31",
        "text": "jsghdfdfakjshdf",
        "likes": "-2",
      }
    ]
  }

    # Process and classify comments in the article
    classified_article = classifier.process_article_comments(article)

    # Display the results

    # print(classified_article['comments'])


    # for c  in classified_article['comments']:
    #     print(c['label'])
    #     print(c['likes'])