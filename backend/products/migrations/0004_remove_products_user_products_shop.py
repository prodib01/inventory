# Generated by Django 5.2 on 2025-04-24 13:21

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0003_products_image'),
        ('users', '0006_alter_shop_currency'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='products',
            name='user',
        ),
        migrations.AddField(
            model_name='products',
            name='shop',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='users.shop'),
            preserve_default=False,
        ),
    ]
